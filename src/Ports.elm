port module Ports exposing (..)

import Json.Encode


port playAudio : String -> Cmd msg


port storeConfig : Json.Encode.Value -> Cmd msg
