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
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


init : ( Model, Cmd Msg )
init =
    ( { playerOne = { player = PlayerOne, time = defaultConfig.duration }
      , playerTwo = { player = PlayerTwo, time = defaultConfig.duration }
      , player = None
      , mode = Stopped
      , config = defaultConfig
      , size = { width = 0, height = 0 }
      , challenge = Nothing
      }
    , Task.perform SizeChanged Window.size
    )



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
    case msg of
        SizeChanged size ->
            ( { model | size = size }, Cmd.none )

        TickSecond t ->
            let
                nextChallenge =
                    Maybe.map decTime model.challenge
                        |> Maybe.andThen checkChallenge
            in
            case model.player of
                None ->
                    ( model, Cmd.none )

                PlayerOne ->
                    ( { model
                        | playerOne = decrement model.playerOne
                        , challenge = nextChallenge
                      }
                    , Cmd.none
                    )

                PlayerTwo ->
                    ( { model
                        | playerTwo = decrement model.playerTwo
                        , challenge = nextChallenge
                      }
                    , Cmd.none
                    )

        Toggle ->
            { model
                | mode =
                    case model.mode of
                        Stopped ->
                            Tick

                        Tick ->
                            Stopped
                , challenge = Nothing
            }
                ! [ playAudio
                        (case model.mode of
                            Stopped ->
                                "snd/resume.mp3"

                            Tick ->
                                "snd/pause.mp3"
                        )
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


subscriptions : Model -> Sub Msg
subscriptions model =
    if model.mode /= Stopped then
        Time.every Time.second TickSecond
    else
        Sub.none
