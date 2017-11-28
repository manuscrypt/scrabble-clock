module View.ResetButton exposing (..)

import Svg exposing (Svg, g, path, rect, svg, text, text_)
import Svg.Attributes exposing (..)
import Touch
import Types exposing (..)
import Util exposing (..)


view : Model -> Svg Msg
view model =
    let
        pos =
            resetButtonPos model

        ( w, h ) =
            ( 36, 36 )
    in
    g
        [ transform <| translate pos
        ]
        (if model.mode /= Tick then
            [ Svg.image
                [ x <| toString (-w / 2)
                , y <| toString (-h / 2)
                , width <| toString w
                , height <| toString h
                , xlinkHref "img/restart.svg"
                , Touch.onStart ResetSwipe
                , Touch.onMove ResetSwipe
                , Touch.onEnd ResetSwipeEnd
                ]
                []
            ]
         else
            []
        )


resetButtonPos : Model -> ( Float, Float )
resetButtonPos model =
    let
        ( w, h ) =
            wh model

        ( dpX, dpY ) =
            ( w / 10, h / 2 )
    in
    if model.resetGesture == Touch.blanco then
        ( dpX, dpY )
    else
        model.resetButtonPos
