module Main exposing (..)

import Html exposing (Html, div, text)
import Json.Decode
import Json.Encode as JE
import Ports exposing (playAudio, storeConfig)
import Svg exposing (Svg)
import Task
import Time exposing (Time)
import Touch
import Types exposing (..)
import View.Game as Game
import View.Settings as Settings exposing (configDecoder, encodeConfig)
import Window exposing (Size)


main : Program JE.Value Model Msg
main =
    Html.programWithFlags
        { init = initWithFlags
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


initWithFlags : JE.Value -> ( Model, Cmd Msg )
initWithFlags val =
    case Json.Decode.decodeValue configDecoder val of
        Ok config ->
            reset config

        Err err ->
            reset (Debug.log (toString err) defaultConfig)


reset : TimerConfig -> ( Model, Cmd Msg )
reset =
    init


initPlayer : TimerConfig -> Player -> Timer
initPlayer config player =
    { player = player, time = config.duration }


init : TimerConfig -> ( Model, Cmd Msg )
init config =
    ( { playerOne = initPlayer config PlayerOne
      , playerTwo = initPlayer config PlayerTwo
      , player = None
      , mode = Stopped Pause
      , config = config
      , size = { width = 0, height = 0 }
      , challenge = Nothing
      , resetGesture = Touch.blanco
      , resetButtonPos = ( 0, 0 )
      }
    , Task.perform SizeChanged Window.size
    )


subscriptions : Model -> Sub Msg
subscriptions model =
    if model.mode == Tick then
        Time.every Time.second TickSecond
    else
        Sub.none


view : Model -> Svg Msg
view model =
    case model.mode of
        Stopped stoppedMode ->
            case stoppedMode of
                Settings ->
                    Settings.view model

                _ ->
                    Game.view model

        Tick ->
            Game.view model



------------ update


decrement : Timer -> Timer
decrement timer =
    { timer | time = decTime timer.time }


decTime : Time -> Time
decTime t =
    t - Time.second


checkChallenge : Float -> Maybe Float
checkChallenge t =
    if t <= 0 then
        Nothing
    else
        Just t


getCoord : Touch.Event -> { x : Float, y : Float }
getCoord ev =
    Touch.locate ev


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SizeChanged size ->
            ( { model | size = size }, Cmd.none )

        ShowSettings ev ->
            ( { model | mode = Stopped Settings }, Cmd.none )

        SaveSettings ->
            { model | mode = Stopped Pause } ! [ storeConfig <| encodeConfig model.config ]

        TimeSettingChanged sett ->
            case sett of
                Duration t ->
                    ( { model | config = (\c -> { c | duration = t }) model.config }, Cmd.none )

                Overtime t ->
                    ( { model | config = (\c -> { c | overtime = t }) model.config }, Cmd.none )

                Challenge t ->
                    ( { model | config = (\c -> { c | challenge = t }) model.config }, Cmd.none )

        SoundSettingChanged ->
            let
                next =
                    (\c -> { c | sound = not c.sound }) model.config
            in
            ( { model | config = next }
            , if next.sound then
                playAudio "snd/resume.mp3"
              else
                Cmd.none
            )

        TickSecond t ->
            let
                nextChallenge =
                    Maybe.map decTime model.challenge
                        |> Maybe.andThen checkChallenge

                nextModel =
                    case model.player of
                        None ->
                            model

                        PlayerOne ->
                            { model
                                | playerOne = decrement model.playerOne
                                , challenge = nextChallenge
                            }

                        PlayerTwo ->
                            { model
                                | playerTwo = decrement model.playerTwo
                                , challenge = nextChallenge
                            }
            in
            if nextModel.playerOne.time <= -nextModel.config.overtime then
                { nextModel | mode = Stopped <| GameOver PlayerOne } ! []
            else if nextModel.playerTwo.time <= -nextModel.config.overtime then
                { nextModel | mode = Stopped <| GameOver PlayerTwo } ! []
            else
                nextModel ! []

        ResetSwipe ev ->
            let
                { x, y } =
                    getCoord ev
            in
            { model
                | resetGesture = Touch.record ev model.resetGesture
                , resetButtonPos = ( x, toFloat model.size.height / 2 )
            }
                ! []

        ResetSwipeEnd ev ->
            let
                gesture =
                    Touch.record ev model.resetGesture

                complete =
                    Touch.isRightSwipe (toFloat model.size.width * 0.75) gesture

                -- use inspection functions like `isTap` and `isLeftSwipe`
            in
            if not complete then
                { model | resetGesture = Touch.blanco } ! []
            else
                reset model.config

        Toggle ->
            { model
                | mode =
                    case model.mode of
                        Stopped _ ->
                            Tick

                        Tick ->
                            Stopped Pause
            }
                ! [ if model.config.sound then
                        case model.mode of
                            Stopped _ ->
                                playAudio "snd/resume.mp3"

                            Tick ->
                                playAudio "snd/pause.mp3"
                    else
                        Cmd.none
                  ]

        Tapped player ->
            ( { model
                | player =
                    case model.player of
                        None ->
                            if player == PlayerOne then
                                PlayerTwo
                            else
                                PlayerOne

                        _ ->
                            case player of
                                None ->
                                    None

                                PlayerOne ->
                                    PlayerTwo

                                PlayerTwo ->
                                    PlayerOne
                , mode =
                    case model.mode of
                        Stopped _ ->
                            Tick

                        _ ->
                            model.mode
                , challenge = Just model.config.challenge
              }
            , if model.config.sound then
                playAudio "snd/click.mp3"
              else
                Cmd.none
            )
