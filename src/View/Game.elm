module View.Game exposing (..)

import Svg exposing (Svg, g, path, rect, svg, text, text_)
import Svg.Attributes exposing (..)
import Touch
import Types exposing (..)
import Util exposing (..)
import View.Countdown as Countdown
import View.PauseButton as PauseButton
import View.ResetButton as ResetButton
import View.Timer as Timer


view : Model -> Svg Msg
view model =
    let
        ( w, h ) =
            wh model

        posOne =
            ( w / 2, h / 6 )

        posTwo =
            ( w / 2, 5 * h / 6 )
    in
    svg [ viewBox <| "0 0 " ++ toString w ++ " " ++ toString h ]
        ([ Timer.view 180 posOne model model.playerOne
         , Timer.view 0 posTwo model model.playerTwo
         , ResetButton.view model
         , viewSettingsButton ( 9 * w / 10, h / 2 ) model
         ]
            ++ (case model.challenge of
                    Nothing ->
                        if model.player /= None && (model.mode == Tick || model.mode == Stopped Pause) then
                            [ PauseButton.view model ]
                        else
                            []

                    Just c ->
                        let
                            rot =
                                model.player == PlayerOne
                        in
                        [ Countdown.view rot c model ]
               )
        )


viewSettingsButton : ( Float, Float ) -> Model -> Svg Msg
viewSettingsButton pos model =
    let
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
                , xlinkHref "img/settings.svg"
                , Touch.onEnd ShowSettings
                ]
                []
            ]
         else
            []
        )
