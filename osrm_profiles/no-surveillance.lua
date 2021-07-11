-- No Surveillance Profile
-- Based on the foot profile

api_version = 2

Set = require('lib/set')
Sequence = require('lib/sequence')
Handlers = require("lib/way_handlers")
find_access_tag = require("lib/access").find_access_tag

-- Start of part borrowed from https://stackoverflow.com/a/11204889/11249686
-- Published unter CC-BY-SA 3.0 by Bart Kiers on Stack Overflow
-- Some modifications were made
function file_exists(file)
	local f = io.open(file, "rb")
	if f then
		f:close()
	end
	return f ~= nil
end

-- get all lines from a file, returns an empty
-- list/table if the file does not exist
function lines_from(file)
	if not file_exists(file) then
		return {}
	end
	lines = {}
	for line in io.lines(file) do
		id = tonumber(line)

		lines[id] = true
	end
	return lines
end

-- End of borrowed part

function setup()
	local walking_speed = 5
	local nodes_files = {
		'surveilled_nodes.txt',
		'data/surveilled_nodes.txt',
		'/opt/NoSurveillanceRouting/surveilled_nodes.txt',
		'/opt/NoSurveillanceRouting/data/surveilled_nodes.txt'
	}
	local ids = nil

	local usable_file = nil
	for _k, _f in ipairs(nodes_files) do
		if file_exists(_f) then
			usable_file = _f
			break
		end
	end

	if usable_file then
		ids = lines_from(usable_file)
	else
		ids = {}
	end

	return {
		properties = {
			weight_name = 'duration',
			max_speed_for_map_matching = 40 / 3.6,

			-- kmph -> m/s
			call_tagless_node_function = false,
			traffic_light_penalty = 2,
			u_turn_penalty = 2,
			continue_straight_at_waypoint = false,
			use_turn_restrictions = false,
		},

		default_mode = mode.walking,
		default_speed = walking_speed,
		oneway_handling = 'specific',

		-- respect 'oneway:foot' but not 'oneway'

		surveilled_nodes = ids,

		barrier_blacklist = Set {'yes', 'wall', 'fence'},

		access_tag_whitelist = Set {'yes', 'foot', 'permissive', 'designated'},

		access_tag_blacklist = Set {
			'no',
			'agricultural',
			'forestry',
			'private',
			'delivery',
		},

		restricted_access_tag_list = Set {},

		restricted_highway_whitelist = Set {},

		construction_whitelist = Set {},

		access_tags_hierarchy = Sequence {'foot', 'access'},

		-- tags disallow access to in combination with highway=service
		service_access_tag_blacklist = Set {},

		restrictions = Sequence {'foot'},

		-- list of suffixes to suppress in name change instructions
		suffix_list = Set {
			'N',
			'NE',
			'E',
			'SE',
			'S',
			'SW',
			'W',
			'NW',
			'North',
			'South',
			'West',
			'East'
		},

		avoid = Set {'impassable'},

		speeds = Sequence {
			highway = {
				primary = walking_speed,
				primary_link = walking_speed,
				secondary = walking_speed,
				secondary_link = walking_speed,
				tertiary = walking_speed,
				tertiary_link = walking_speed,
				unclassified = walking_speed,
				residential = walking_speed,
				road = walking_speed,
				living_street = walking_speed,
				service = walking_speed,
				track = walking_speed,
				path = walking_speed,
				steps = walking_speed,
				pedestrian = walking_speed,
				footway = walking_speed,
				pier = walking_speed,
			},

			railway = {platform = walking_speed},

			amenity = {
				parking = walking_speed,
				parking_entrance = walking_speed
			},

			man_made = {pier = walking_speed},

			leisure = {track = walking_speed}
		},

		route_speeds = {ferry = 5},

		bridge_speeds = {},

		surface_speeds = {
			fine_gravel = walking_speed * 0.75,
			gravel = walking_speed * 0.75,
			pebblestone = walking_speed * 0.75,
			mud = walking_speed * 0.5,
			sand = walking_speed * 0.5
		},

		tracktype_speeds = {},

		smoothness_speeds = {}
	}
end

function handle_no_surveillance_tag(profile, way, result, data)
	data.is_surveilled = way:get_value_by_key('is_surveilled')
	data.name = way:get_value_by_key('name')

	if data.is_surveilled == 'yes' then
		return false
	end
end

function getAllData(t, prevData)
	-- if prevData == nil, start empty, otherwise start with prevData
	local data = prevData or {}

	-- copy all the attributes from t
	for k, v in pairs(t) do
		data[k] = data[k] or v
	end

	-- get t's metatable, or exit if not existing
	local mt = getmetatable(t)
	if type(mt) ~= 'table' then
		return data
	end

	-- get the __index from mt, or exit if not table
	local index = mt.__index
	if type(index) ~= 'table' then
		return data
	end

	-- include the data from index into data, recursively, and return
	return getAllData(index, data)
end

function process_node(profile, node, result, relations)
	-- parse access and barrier tags
	local access = find_access_tag(node, profile.access_tags_hierarchy)
	local is_surveilled = node:get_value_by_key("is_surveilled")
	is_surveilled = is_surveilled == 'yes'
	local is_surveilled_id = not not profile.surveilled_nodes[node:id()]

	--if is_surveilled or is_surveilled_id then
	if is_surveilled_id then
		result.barrier = true
	end

	--if is_atm then
	--  print(amenity)
	--  result.barrier = true
	--end

	if access then
		if profile.access_tag_blacklist[access] then
			result.barrier = true
		end
	else
		if barrier then
			--  make an exception for rising bollard barriers
			local bollard = node:get_value_by_key("bollard")
			local rising_bollard = bollard and "rising" == bollard

			if profile.barrier_blacklist[barrier] and not rising_bollard then
				result.barrier = true
			end
		end
	end

	-- check if node is a traffic light
	local tag = node:get_value_by_key("highway")
	if "traffic_signals" == tag then
		result.traffic_lights = true
	end
end

-- main entry point for processsing a way
function process_way(profile, way, result)
	-- the intial filtering of ways based on presence of tags
	-- affects processing times significantly, because all ways
	-- have to be checked.
	-- to increase performance, prefetching and intial tag check
	-- is done in directly instead of via a handler.

	-- in general we should  try to abort as soon as
	-- possible if the way is not routable, to avoid doing
	-- unnecessary work. this implies we should check things that
	-- commonly forbids access early, and handle edge cases later.

	-- data table for storing intermediate values during processing
	local data = {
		-- prefetch tags
		highway = way:get_value_by_key('highway'),
		bridge = way:get_value_by_key('bridge'),
		route = way:get_value_by_key('route'),
		leisure = way:get_value_by_key('leisure'),
		man_made = way:get_value_by_key('man_made'),
		railway = way:get_value_by_key('railway'),
		platform = way:get_value_by_key('platform'),
		amenity = way:get_value_by_key('amenity'),
		public_transport = way:get_value_by_key('public_transport')
	}

	-- perform an quick initial check and abort if the way is
	-- obviously not routable. here we require at least one
	-- of the prefetched tags to be present, ie. the data table
	-- cannot be empty
	if next(data) == nil then
		-- is the data table empty?
		return
	end

	local handlers = Sequence {
		-- set the default mode for this profile. if can be changed later
		-- in case it turns we're e.g. on a ferry
		WayHandlers.default_mode,

		-- check various tags that could indicate that the way is not
		-- routable. this includes things like status=impassable,
		-- toll=yes and oneway=reversible
		WayHandlers.blocked_ways,

		handle_no_surveillance_tag,

		-- determine access status by checking our hierarchy of
		-- access tags, e.g: motorcar, motor_vehicle, vehicle
		WayHandlers.access,

		-- check whether forward/backward directons are routable
		WayHandlers.oneway,

		-- check whether forward/backward directons are routable
		WayHandlers.destinations,

		-- check whether we're using a special transport mode
		WayHandlers.ferries,
		WayHandlers.movables,

		-- compute speed taking into account way type, maxspeed tags, etc.
		WayHandlers.speed,
		WayHandlers.surface,

		-- handle turn lanes and road classification, used for guidance
		WayHandlers.classification,

		-- handle various other flags
		WayHandlers.roundabouts,
		WayHandlers.startpoint,

		-- set name, ref and pronunciation
		WayHandlers.names,

		-- set weight properties of the way
		WayHandlers.weights
	}

	WayHandlers.run(profile, way, result, data, handlers)
end

function process_turn(profile, turn)
	turn.duration = 0.

	if turn.direction_modifier == direction_modifier.u_turn then
		turn.duration = turn.duration + profile.properties.u_turn_penalty
	end

	if turn.has_traffic_light then
		turn.duration = profile.properties.traffic_light_penalty
	end
	if profile.properties.weight_name == 'routability' then
		-- penalize turns from non-local access only segments onto local access only tags
		if not turn.source_restricted and turn.target_restricted then
			turn.weight = turn.weight + 3000
		end
	end
end

return {
	setup = setup,
	process_way = process_way,
	process_node = process_node,
	process_turn = process_turn
}
