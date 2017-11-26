module View.Timer exposing (..)

import Svg exposing (Svg, g, path, rect, svg, text, text_)
import Svg.Attributes exposing (..)
import Touch
import Types exposing (..)
import Util exposing (..)


view : Float -> ( Float, Float ) -> Model -> Timer -> Svg.Svg Msg
view rot pos model timer =
    let
        isActive =
            case model.mode of
                Stopped mode ->
                    case mode of
                        Pause ->
                            True

                        _ ->
                            False

                Tick ->
                    timer.player == model.player || model.player == None
    in
    g
        [ transform <|
            translate pos
                ++ " rotate("
                ++ toString rot
                ++ ")"
        ]
        [ text_
            [ textAnchor "middle"
            , fontSize "120"
            , fontWeight "bold"
            , dominantBaseline "middle"
            , stroke "black"
            , strokeWidth "2"
            , class "timer-text"
            , opacity
                (if isActive then
                    "1"
                 else
                    "0.5"
                )
            , fill
                (if isActive then
                    "black"
                 else
                    "grey"
                )
            ]
            [ text <| timeToString timer.time ]
        , tapRect isActive
            pos
            model
            timer.player
        ]


tapRect : Bool -> ( Float, Float ) -> Model -> Player -> Svg Msg
tapRect isActive ( posX, posY ) model player =
    let
        ( w, h ) =
            ( toFloat model.size.width, toFloat model.size.height / 2 )

        backgroundColor =
            case model.mode of
                Stopped stopMode ->
                    case stopMode of
                        GameOver loser ->
                            if loser == player then
                                "red"
                            else
                                "green"

                        _ ->
                            "transparent"

                _ ->
                    "transparent"
    in
    rect
        ([ x <| toString (-w / 2)
         , y <| toString (-h / 2)
         , width <| toString w
         , height <| toString h
         , stroke
            (if isActive then
                "black"
             else
                "none"
            )
         , strokeWidth "1"
         , fill backgroundColor
         , opacity "0.1"
         ]
            ++ (if isActive then
                    [ Touch.onStart (\event -> Tapped player) ]
                else
                    []
               )
        )
        []
