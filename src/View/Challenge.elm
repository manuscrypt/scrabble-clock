module View.Challenge exposing (..)

import Svg exposing (Svg, g, path, rect, svg, text, text_)
import Svg.Attributes exposing (..)
import Touch
import Types exposing (..)
import Util exposing (..)


view : Model -> Svg Msg
view model =
    let
        ( w, h ) =
            ( 66, 60 )
    in
    g
        [ transform <| translate ( toFloat model.size.width / 2, toFloat model.size.height / 2 )
        ]
        [ pause (model.mode == Stopped Pause)
            model.config.challenge
            (Maybe.withDefault 0 <| model.challenge)
        , rect
            [ x <| toString (-w / 2)
            , y <| toString (-h / 2)
            , width <| toString w
            , height <| toString h
            , fill "transparent"
            , Touch.onStart (\event -> Toggle)
            ]
            []
        ]


pause : Bool -> Float -> Float -> Svg Msg
pause stopped challengeSecs secsLeft =
    let
        half =
            challengeSecs / 2

        c1 =
            Basics.min half secsLeft / half

        c2 =
            if c1 >= 1 then
                (secsLeft - half) / half
            else
                0
    in
    g []
        [ bar stopped c1 ( -20, 0 ) ( 26, 60 )
        , bar stopped c2 ( 20, 0 ) ( 26, 60 )
        ]


bar : Bool -> Float -> ( Float, Float ) -> ( Float, Float ) -> Svg Msg
bar stopped secsPerc ( posX, posY ) ( w, h ) =
    g [ transform <| translate ( posX, posY ) ]
        [ rect
            [ x <| toString (-w / 2)
            , y <| toString (-h / 2)
            , width <| toString w
            , height <| toString h
            , fill "grey"
            , stroke "black"
            ]
            []
        , rect
            [ x <| toString (-w / 2)
            , y <| toString (-h / 2)
            , width <| toString w
            , height <| toString (h * secsPerc)
            , fill <|
                if stopped then
                    "red"
                else
                    "orange"
            , stroke "none"
            ]
            []
        ]
