module Main exposing (..)

import Html exposing (Html, div, text)
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
      }
    , Task.perform SizeChanged Window.size
    )



------------ update


decrement : Timer -> Timer
decrement timer =
    { timer | time = timer.time - Time.second }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case Debug.log "msg" msg of
        SizeChanged size ->
            ( { model | size = size }, Cmd.none )

        TickSecond t ->
            case model.player of
                None ->
                    ( model, Cmd.none )

                PlayerOne ->
                    ( { model | playerOne = decrement model.playerOne }, Cmd.none )

                PlayerTwo ->
                    ( { model | playerTwo = decrement model.playerTwo }, Cmd.none )

        Toggle ->
            { model
                | mode =
                    case model.mode of
                        Stopped ->
                            Tick

                        Tick ->
                            Stopped

                        Challenge ->
                            Stopped
            }
                ! []

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
              }
            , Cmd.none
            )


subscriptions : Model -> Sub Msg
subscriptions model =
    if model.mode /= Stopped then
        Time.every Time.second TickSecond
    else
        Sub.none
