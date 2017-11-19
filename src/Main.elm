module Main exposing (..)

import Html exposing (Html, div, text)
import Touch


type alias Model =
    { count : Int }


type Msg
    = Tapped


main : Program Never Model Msg
main =
    Html.program
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


init : ( Model, Cmd msg )
init =
    ( { count = 0 }, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Tapped ->
            { model | count = model.count + 1 } ! []


view : Model -> Html Msg
view model =
    div []
        [ div [ Touch.onEnd (\event -> Tapped) ]
            [ text "Hello from Elm!" ]
        , text <| "Tapcount: " ++ toString model.count
        ]


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none
