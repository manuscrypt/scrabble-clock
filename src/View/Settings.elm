module View.Settings exposing (..)

import Bootstrap.Button as Button exposing (onClick)
import Bootstrap.ButtonGroup as ButtonGroup
import Bootstrap.Form as Form
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col exposing (topLg)
import ColorPicker
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
            [ formRow "Play time" <| durations model
            , formRow "Overtime" <| overtimes model
            , formRow "Challenge time" <| challenges model
            , formRow "Accent Color" <| textColor model
            , formRow "Audio effects" <| soundCheck model
            , formRow " " <| saveButton
            ]
        ]


textColor : Model -> Html Msg
textColor model =
    ColorPicker.view model.config.textColor model.colorPicker
        |> Html.map ColorPickerMsg


saveButton : Html Msg
saveButton =
    Button.button
        [ Button.onClick SaveSettings
        , Button.small
        , Button.secondary
        ]
        [ text "Save and return" ]


formRow : String -> Html msg -> Html msg
formRow label content =
    Form.row []
        [ Form.colLabel [ Col.sm2 ] [ h6 [] [ text label ] ]
        , Form.col [ Col.sm10 ] [ content ]
        ]


soundCheck : { b | config : { a | sound : Bool } } -> Html Msg
soundCheck model =
    [ ( "On", True ), ( "Off", False ) ]
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
    [ 30, 25, 20 ]
        |> List.map minutes
        |> myRadioButtonGroup Duration model.config.duration


overtimes : { b | config : { a | overtime : Seconds } } -> Html Msg
overtimes model =
    [ 15, 10, 5 ]
        |> List.map minutes
        |> myRadioButtonGroup Overtime model.config.overtime


challenges : { b | config : { a | challenge : Seconds } } -> Html Msg
challenges model =
    [ 25, 20, 15 ]
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
