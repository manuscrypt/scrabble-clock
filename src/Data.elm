module Data exposing (..)

import Json.Decode as JD
import Json.Encode as JE
import Time exposing (Time)
import Util exposing (..)


type alias Seconds =
    Float


type alias TimerConfig =
    { duration : Seconds
    , overtime : Seconds
    , challenge : Seconds
    , sound : Bool
    }


encodeConfig : TimerConfig -> JE.Value
encodeConfig config =
    JE.object
        [ (,) "duration" <| JE.float config.duration
        , (,) "overtime" <| JE.float config.overtime
        , (,) "challenge" <| JE.float config.challenge
        , (,) "sound" <| JE.bool config.sound
        ]


configDecoder : JD.Decoder TimerConfig
configDecoder =
    JD.oneOf
        [ JD.null defaultConfig
        , JD.map4 TimerConfig
            (JD.field "duration" JD.float)
            (JD.field "overtime" JD.float)
            (JD.field "challenge" JD.float)
            (JD.field "sound" JD.bool)
        ]


defaultConfig : TimerConfig
defaultConfig =
    { duration = minutes 25
    , overtime = minutes 10
    , challenge = 20 * Time.second
    , sound = True
    }
