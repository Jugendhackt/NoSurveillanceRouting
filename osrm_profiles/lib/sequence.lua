-- Copyright 2017-2021 The Project OSRM contributors
-- OSRM is licensed under BSD 2-Clause (https://github.com/Project-OSRM/osrm-backend/blob/master/LICENSE.TXT)


-- Sequence of items
-- Ordered, but have to loop through items to check for inclusion.
-- Currently the same as a table.
-- Adds the convenience function append() to append to the sequnce.

function Sequence(source)
  return source
end

return Sequence
