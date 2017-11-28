module View.Countdown exposing (..)

import Curve
import SubPath exposing (..)
import Svg exposing (Svg, g, path, rect, svg, text, text_)
import Svg.Attributes exposing (..)
import Time exposing (Time)
import Touch
import Types exposing (..)
import Util


view : Bool -> Float -> Model -> Svg Msg
view rot remaining model =
    let
        dx =
            remaining
                / model.config.challenge

        ps =
            List.map
                (\i ->
                    let
                        fi =
                            toFloat i

                        dy =
                            fi / 360
                    in
                    ( degrees fi
                    , if dy < dx then
                        25
                      else
                        0
                    )
                )
            <|
                List.range 0 360

        aps =
            List.map
                (\( a, r ) ->
                    ( a
                    , if r == 25 then
                        0
                      else
                        25
                    )
                )
                ps

        sub =
            Curve.radial ( 0, 0 ) ps

        sub2 =
            Curve.radial ( 0, 0 ) aps

        inner =
            Curve.radial ( 0, 0 ) <| List.map (\i -> ( toFloat i, 20 )) <| List.range 0 360

        outer =
            Curve.radial ( 0, 0 ) <| List.map (\i -> ( toFloat i, 30 )) <| List.range 0 360
    in
    g
        [ transform <| Util.translate ( toFloat model.size.width / 2, toFloat model.size.height / 2 ) ++ " scale(1.5)"
        , Touch.onStart (\event -> Toggle)
        ]
        [ --SubPath.element outer [ class "outer" ]
          SubPath.element sub [ class "pie" ]
        , SubPath.element sub2 [ fill <| Util.toRgbaString model.config.textColor ]

        --, SubPath.element (Curve.linear [ ( 0, 0 ), ( 0, 1 ) ]) [ stroke "black" ]
        , SubPath.element inner
            [ class <|
                "inner"
                    ++ (if model.mode == Stopped Pause then
                            " off"
                        else
                            " on"
                       )
            ]
        , timeLeft rot (model.mode == Stopped Pause) remaining
        ]


timeLeft : Bool -> Bool -> Time -> Svg msg
timeLeft rot off time =
    text_
        ([ class <|
            "time-left"
                ++ (if off then
                        " off"
                    else
                        ""
                   )
         , fontSize "14"
         ]
            ++ (if rot then
                    [ transform "rotate(180)" ]
                else
                    []
               )
        )
        [ text <| Util.timeToString time ]
