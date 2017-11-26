module Util exposing (..)

import Time exposing (Time)
import Time.Format as Time
import Types exposing (..)


type alias Pos =
    ( Float, Float )


wh : Model -> ( Float, Float )
wh model =
    ( toFloat model.size.width
    , toFloat model.size.height
    )


timeToString : Time -> String
timeToString time =
    let
        s =
            Time.format "%M:%S" (abs time)
    in
    if time < 0 then
        "-" ++ s
    else
        s


translate : ( a, b ) -> String
translate ( posX, posY ) =
    "translate(" ++ toString posX ++ "," ++ toString posY ++ ")"
