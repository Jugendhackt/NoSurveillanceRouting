-- Copyright 2017-2021 The Project OSRM contributors
-- OSRM is licensed under BSD 2-Clause (https://github.com/Project-OSRM/osrm-backend/blob/master/LICENSE.TXT)

local math = math

local MaxSpeed = {}

function MaxSpeed.limit(way,max,maxf,maxb)
  if maxf and maxf>0 then
    way.forward_speed = math.min(way.forward_speed, maxf)
  elseif max and max>0 then
    way.forward_speed = math.min(way.forward_speed, max)
  end

  if maxb and maxb>0 then
    way.backward_speed = math.min(way.backward_speed, maxb)
  elseif max and max>0 then
    way.backward_speed = math.min(way.backward_speed, max)
  end
end

return MaxSpeed
