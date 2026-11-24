-- ==============================================================================
-- Open Ethiopia Map - Unified National Vehicle Lua Profile for OSRM
-- Optimized for: Addis Ababa Expressways + Gondar Hills & Cobblestone (Chigign)
-- Supported Vehicles: Cars, Minibuses, Bajaj (Three-wheelers), Motorbikes
-- Memory Footprint: Fits in < 250MB RAM with Multi-Level Dijkstra (MLD)
-- ==============================================================================

api_version = 4

Set = require('lib/set')
Sequence = require('lib/sequence')
Handlers = require('lib/way_handlers')
find_access_tag = require('lib/access').find_access_tag
limit = require('lib/maxspeed').limit

function setup()
  return {
    properties = {
      max_speed_for_map_matching      = 120/3600, -- 120 km/h
      weight_name                     = 'duration',
      process_call_tagless_node       = false,
      u_turn_penalty                  = 20,
      continue_straight_at_waypoint   = true,
      use_turn_restrictions          = true,
      left_hand_driving               = false,
      traffic_signal_penalty          = 7,
      side_road_multiplier            = 0.8
    },

    default_mode              = mode.driving,
    default_speed             = 30,

    -- Speed calibrated for Ethiopian road hierarchy (km/h)
    speeds = Sequence {
      highway = {
        motorway        = 80,
        motorway_link   = 45,
        trunk           = 65,
        trunk_link      = 40,
        primary         = 45, -- Bole Road, Debre Zeit Rd, Gondar Highway
        primary_link    = 30,
        secondary       = 35,
        secondary_link  = 25,
        tertiary        = 28,
        tertiary_link   = 20,
        unclassified    = 22,
        residential     = 20, -- Neighborhood streets
        living_street   = 15, -- Narrow cobblestone alleys
        service         = 12, -- Compound driveways / gates
        track           = 12, -- Dirt tracks
      }
    },

    -- Surface speed penalties for Ethiopia (km/h)
    -- Widespread Chigign (cobblestone) and unpaved roads heavily penalize speed
    surface_speeds = {
      ["asphalt"]      = 45,
      ["paved"]        = 40,
      ["concrete"]     = 35,
      ["sett"]         = 18, -- Cobblestone (Chigign in Kebele 18, Arada, Jemo, Ayat)
      ["cobblestone"]  = 16,
      ["unpaved"]      = 12,
      ["compacted"]    = 14,
      ["dirt"]         = 10,
      ["gravel"]       = 12,
      ["ground"]       = 10,
      ["earth"]        = 10,
      ["sand"]         = 8,
      ["mud"]          = 6
    },

    -- Smoothness penalties
    smoothness_speeds = {
      ["good"]         = 40,
      ["intermediate"] = 25,
      ["bad"]          = 15,
      ["very_bad"]     = 10,
      ["horrible"]     = 6
    },

    -- Allowed highway tags (strictly motorized drivable roads)
    access_tag_whitelist = Set {
      'yes', 'motorcar', 'motorcycle', 'vehicle', 'permissive', 'destination'
    },

    access_tag_blacklist = Set {
      'no', 'private', 'agricultural', 'forestry', 'emergency'
    },

    -- Highway types that are drivable
    service_tag_forbidden = Set {
      'emergency_access'
    },

    -- Barrier handling
    barrier_whitelist = Set {
      'toll_booth', 'border_control', 'gate', 'lift_gate'
    }
  }
end

function process_node(profile, node, result, relations)
  local barrier = node:get_value_by_key("barrier")
  local access = find_access_tag(node, profile.access_tag_whitelist)
  
  if barrier and not profile.barrier_whitelist[barrier] and access ~= 'yes' then
    result.barrier = true
  end

  local highway = node:get_value_by_key("highway")
  if highway == "traffic_signals" then
    result.traffic_lights = true
  end
end

function process_way(profile, way, result, relations)
  local data = {
    highway = way:get_value_by_key('highway')
  }

  if not data.highway then
    return
  end

  -- Exclude pedestrian stairs and footpaths from motorized vehicle routing
  if data.highway == 'steps' or data.highway == 'footway' or data.highway == 'path' or data.highway == 'pedestrian' or data.highway == 'cycleway' then
    return
  end

  local speed = profile.speeds.highway[data.highway]
  if not speed then
    return
  end

  -- Surface speed calibration (Chigign / Cobblestone / Dirt)
  local surface = way:get_value_by_key('surface')
  if surface and profile.surface_speeds[surface] then
    local surf_speed = profile.surface_speeds[surface]
    if surf_speed < speed then
      speed = surf_speed
    end
  end

  -- Smoothness override
  local smoothness = way:get_value_by_key('smoothness')
  if smoothness and profile.smoothness_speeds[smoothness] then
    local smooth_speed = profile.smoothness_speeds[smoothness]
    if smooth_speed < speed then
      speed = smooth_speed
    end
  end

  -- One way detection
  local oneway = way:get_value_by_key('oneway')
  if oneway == 'yes' or oneway == '1' or oneway == 'true' then
    result.forward_mode = profile.default_mode
    result.backward_mode = mode.inaccessible
  elseif oneway == '-1' then
    result.forward_mode = mode.inaccessible
    result.backward_mode = profile.default_mode
  else
    result.forward_mode = profile.default_mode
    result.backward_mode = profile.default_mode
  end

  result.forward_speed = speed
  result.backward_speed = speed

  local name = way:get_value_by_key('name')
  local ref = way:get_value_by_key('ref')
  if name then
    result.name = name
  elseif ref then
    result.name = ref
  end
end

function process_turn(profile, turn)
  turn.duration = 0.0

  if turn.direction_modifier == direction_modifier.u_turn then
    turn.duration = turn.duration + profile.properties.u_turn_penalty
  end

  if turn.has_traffic_light then
    turn.duration = turn.duration + profile.properties.traffic_signal_penalty
  end
end

return {
  setup = setup,
  process_way = process_way,
  process_node = process_node,
  process_turn = process_turn
}
