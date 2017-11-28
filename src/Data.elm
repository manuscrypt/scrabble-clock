module Data exposing (..)

import Color exposing (Color, toRgb)
import Json.Decode as JD
import Json.Decode.Pipeline exposing (decode, optional, required)
import Json.Encode as JE
import Time exposing (Time)
import Util exposing (..)


type alias Seconds =
    Float


type alias TimerConfig =
    { duration : Seconds
    , overtime : Seconds
    , challenge : Seconds
    , textColor : Color
    , sound : Bool
    }


encodeConfig : TimerConfig -> JE.Value
encodeConfig config =
    JE.object
        [ (,) "duration" <| JE.float config.duration
        , (,) "overtime" <| JE.float config.overtime
        , (,) "challenge" <| JE.float config.challenge
        , (,) "color" <| encodeColor config.textColor
        , (,) "sound" <| JE.bool config.sound
        ]


encodeColor : Color -> JE.Value
encodeColor color =
    let
        { red, green, blue, alpha } =
            toRgb color
    in
    JE.object
        [ (,) "r" <| JE.int red
        , (,) "g" <| JE.int green
        , (,) "b" <| JE.int blue
        , (,) "a" <| JE.float alpha
        ]


configDecoder : JD.Decoder TimerConfig
configDecoder =
    JD.oneOf
        [ JD.null defaultConfig
        , decode TimerConfig
            |> required "duration" JD.float
            |> required "overtime" JD.float
            |> required "challenge" JD.float
            |> optional "color" colorDecoder defaultColor
            |> required "sound" JD.bool
        ]


colorDecoder : JD.Decoder Color
colorDecoder =
    decode Color.rgba
        |> required "r" JD.int
        |> required "g" JD.int
        |> required "b" JD.int
        |> required "a" JD.float


defaultColor : Color
defaultColor =
    Color.rgb 0 177 0


defaultConfig : TimerConfig
defaultConfig =
    { duration = minutes 25
    , overtime = minutes 10
    , challenge = 20 * Time.second
    , textColor = defaultColor
    , sound = True
    }
