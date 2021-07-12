-- Copyright 2017-2021 The Project OSRM contributors
-- OSRM is licensed under BSD 2-Clause (https://github.com/Project-OSRM/osrm-backend/blob/master/LICENSE.TXT)

local ipairs = ipairs

local Access = {}

function Access.find_access_tag(source,access_tags_hierarchy)
    for i,v in ipairs(access_tags_hierarchy) do
        local tag = source:get_value_by_key(v)
        if tag then
            return tag
        end
    end
    return nil
end

return Access
