module SettingsView exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Time
import Types exposing (..)
import Util exposing (..)


durations : { b | config : { a | duration : Seconds } } -> List (Html Msg)
durations model =
    [ 30, 25, 20 ]
        |> List.map ((*) 60)
        |> List.map secs
        |> List.map (\s -> timeButton s model.config.duration Duration)


overtimes : { b | config : { a | overtime : Seconds } } -> List (Html Msg)
overtimes model =
    [ 15, 10, 5 ]
        |> List.map ((*) 60)
        |> List.map secs
        |> List.map (\s -> timeButton s model.config.overtime Overtime)


challenges : { b | config : { a | challenge : Seconds } } -> List (Html Msg)
challenges model =
    [ 25, 20, 15 ]
        |> List.map secs
        |> List.map (\s -> timeButton s model.config.challenge Challenge)


secs : Float -> Float
secs x =
    Time.second * x


view : Model -> Html Msg
view model =
    div [ class "settings" ]
        [ h1 [] [ text "Einstellungen (Min:Sek)" ]
        , h2 [] [ text "Spielzeit pro Spieler" ]
        , div [] <| durations model
        , h2 [] [ text "Maximale Überzeit" ]
        , div [] <| overtimes model
        , h2 [] [ text "Zeit zum Anzweifeln" ]
        , div [] <| challenges model
        , h2 [] [ text "Audio-Effekte" ]
        , div []
            [ button [ onClick SoundSettingChanged ]
                [ text
                    (if model.config.sound then
                        "An"
                     else
                        "Aus"
                    )
                ]
            ]
        , hr [] []
        , button [ onClick SaveSettings ] [ text "Speichern" ]
        ]


timeButton : Seconds -> Seconds -> (Seconds -> TimeSetting) -> Html Msg
timeButton secs current setting =
    button
        [ onClick <| TimeSettingChanged <| setting secs
        , classList [ (,) "active-button" (secs == current) ]
        ]
        [ text <| timeToString secs ]
