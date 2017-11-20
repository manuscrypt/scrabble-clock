module Main exposing (..)

import Html exposing (Html, div, text)
import Ports exposing (playAudio)
import Task
import Time exposing (Time)
import Types exposing (..)
import View exposing (view)
import Window exposing (Size)


main : Program Never Model Msg
main =
    Html.program
        { init = reset
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


reset : ( Model, Cmd Msg )
reset =
    init defaultConfig


initPlayer : TimerConfig -> Player -> Timer
initPlayer config player =
    { player = player, time = config.duration }


init : TimerConfig -> ( Model, Cmd Msg )
init config =
    ( { playerOne = initPlayer config PlayerOne
      , playerTwo = initPlayer config PlayerTwo
      , player = None
      , mode = Stopped
      , config = config
      , size = { width = 0, height = 0 }
      , challenge = Nothing
      }
    , Task.perform SizeChanged Window.size
    )


subscriptions : Model -> Sub Msg
subscriptions model =
    if model.mode == Tick then
        Time.every Time.second TickSecond
    else
        Sub.none



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


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case Debug.log "msg" msg of
        SizeChanged size ->
            ( { model | size = size }, Cmd.none )

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
                { nextModel | mode = GameOver PlayerOne } ! []
            else if nextModel.playerTwo.time <= -nextModel.config.overtime then
                { nextModel | mode = GameOver PlayerTwo } ! []
            else
                nextModel ! []

        Reset ->
            reset

        Toggle ->
            { model
                | mode =
                    case model.mode of
                        Stopped ->
                            Tick

                        Tick ->
                            Stopped

                        GameOver _ ->
                            Stopped
                , challenge = Nothing
                , player = None
            }
                ! [ case model.mode of
                        Stopped ->
                            playAudio "snd/resume.mp3"

                        Tick ->
                            playAudio "snd/pause.mp3"

                        GameOver _ ->
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

                        PlayerOne ->
                            PlayerTwo

                        PlayerTwo ->
                            PlayerOne
                , mode =
                    case model.mode of
                        Stopped ->
                            Tick

                        _ ->
                            model.mode
                , challenge = Just model.config.challenge
              }
            , playAudio "snd/click.mp3"
            )
