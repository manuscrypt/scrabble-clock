module View.Settings exposing (..)

import Bootstrap.Button as Button exposing (onClick)
import Bootstrap.ButtonGroup as ButtonGroup
import Bootstrap.Form as Form
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col exposing (topLg)
import Data exposing (..)
import Html exposing (..)
import Html.Attributes exposing (class)
import Time exposing (Time)
import Types exposing (..)
import Util exposing (..)


view : Model -> Html Msg
view model =
    Grid.containerFluid [ class "settings" ]
        [ Form.form []
            [ h4 [] [ text "Einstellungen" ]
            , formRow "Spielzeit pro Spieler" <| durations model
            , formRow "Maximale Überzeit" <| overtimes model
            , formRow "Zeit zum Anzweifeln" <| challenges model
            , formRow "Audio-Effekte" <| soundCheck model
            , hr [] []
            , Form.row []
                [ Form.col [ Col.sm4 ] [ text " " ]
                , Form.col [ Col.sm2 ] [ saveButton ]
                ]
            ]
        ]


saveButton : Html Msg
saveButton =
    Button.button
        [ Button.onClick SaveSettings
        , Button.small
        , Button.secondary
        ]
        [ text "Speichern" ]


formRow : String -> Html msg -> Html msg
formRow label content =
    Form.row []
        [ Form.colLabel [ Col.sm2 ] [ text label ]
        , Form.col [ Col.sm10 ] [ content ]
        ]


soundCheck : { b | config : { a | sound : Bool } } -> Html Msg
soundCheck model =
    [ ( "An", True ), ( "Aus", False ) ]
        |> List.map
            (\( txt, b ) ->
                ButtonGroup.radioButton (b == model.config.sound)
                    [ if model.config.sound == b then
                        Button.success
                      else
                        Button.secondary
                    , Button.small
                    , Button.attrs [ class "ml-1" ]
                    , Button.onClick SoundSettingChanged
                    ]
                    [ text txt ]
            )
        |> ButtonGroup.radioButtonGroup [ ButtonGroup.small ]


durations : { b | config : { a | duration : Seconds } } -> Html Msg
durations model =
    [ 30, 25, 20, 1 / 12 ]
        |> List.map minutes
        |> myRadioButtonGroup Duration model.config.duration


overtimes : { b | config : { a | overtime : Seconds } } -> Html Msg
overtimes model =
    [ 15, 10, 5, 1 / 12 ]
        |> List.map minutes
        |> myRadioButtonGroup Overtime model.config.overtime


challenges : { b | config : { a | challenge : Seconds } } -> Html Msg
challenges model =
    [ 25, 20, 15, 3 ]
        |> List.map secs
        |> myRadioButtonGroup Challenge model.config.challenge


myRadioButtonGroup : (Time -> TimeSetting) -> Time -> List Time -> Html Msg
myRadioButtonGroup setting value times =
    times
        |> List.map
            (\s ->
                ButtonGroup.radioButton (value == s)
                    [ if value == s then
                        Button.success
                      else
                        Button.secondary
                    , Button.small
                    , Button.attrs [ class "ml-1" ]
                    , Button.onClick <| TimeSettingChanged (setting s)
                    ]
                    [ text <| timeToString s ]
            )
        |> ButtonGroup.radioButtonGroup [ ButtonGroup.small ]
