module View.Settings exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as JD
import Json.Encode as JE
import Time
import Types exposing (..)
import Util exposing (..)


encodeConfig : TimerConfig -> JE.Value
encodeConfig config =
    JE.object
        [ (,) "duration" <| JE.float config.duration
        , (,) "overtime" <| JE.float config.overtime
        , (,) "challenge" <| JE.float config.challenge
        , (,) "sound" <| JE.bool config.sound
        ]


configDecoder : JD.Decoder TimerConfig
configDecoder =
    JD.oneOf
        [ JD.null defaultConfig
        , JD.map4 TimerConfig
            (JD.field "duration" JD.float)
            (JD.field "overtime" JD.float)
            (JD.field "challenge" JD.float)
            (JD.field "sound" JD.bool)
        ]


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
