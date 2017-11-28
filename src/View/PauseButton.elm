module View.PauseButton exposing (..)

import Curve
import SubPath
import Svg exposing (Svg, g, path, rect, svg, text, text_)
import Svg.Attributes exposing (..)
import Touch
import Types exposing (..)
import Util exposing (..)


view : Model -> Svg Msg
view model =
    let
        ( w, h ) =
            ( 32, 32 )
    in
    g
        [ transform <| translate ( toFloat model.size.width / 2, toFloat model.size.height / 2 )
        ]
        [ pause ( w, h )
            (model.mode == Stopped Pause)
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


pause : ( Float, Float ) -> Bool -> Float -> Float -> Svg Msg
pause ( w, h ) stopped challengeSecs secsLeft =
    let
        tri =
            Curve.linear [ ( -16, -16 ), ( -16, 16 ), ( 0, 0 ) ]

        box x =
            Curve.linear [ ( x, -16 ), ( x, 16 ), ( x + 16 / 3, 16 ), ( x + 16 / 3, -16 ) ]

        c1 =
            "#434343"

        c2 =
            "#006600"
    in
    g []
        [ SubPath.element tri
            [ fill <|
                if not stopped then
                    c2
                else
                    c1
            ]
        , SubPath.element (box 0)
            [ fill <|
                if stopped then
                    c2
                else
                    c1
            ]
        , SubPath.element (box (2 * 16 / 3))
            [ fill <|
                if stopped then
                    c2
                else
                    c1
            ]
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
