module View exposing (..)

import Svg exposing (Svg, g, path, rect, svg, text, text_)
import Svg.Attributes exposing (..)
import Time exposing (Time)
import Time.Format as Time
import Touch
import Types exposing (..)


type alias Pos =
    ( Float, Float )


wh : Model -> ( Float, Float )
wh model =
    ( toFloat model.size.width
    , toFloat model.size.height
    )


view : Model -> Svg Msg
view model =
    let
        ( w, h ) =
            wh model

        posOne =
            ( w / 2, h / 4 )

        posTwo =
            ( w / 2, 3 * h / 4 )
    in
    svg [ viewBox <| "0 0 " ++ toString w ++ " " ++ toString h ]
        ([ viewTimer 180 posOne model model.playerOne
         , viewTimer 0 posTwo model model.playerTwo
         , viewResetButton (resetButtonPos model) model
         ]
            ++ (case model.mode of
                    GameOver _ ->
                        []

                    _ ->
                        if model.player /= None then
                            [ viewButton model
                            ]
                        else
                            []
               )
        )


resetButtonPos : Model -> ( Float, Float )
resetButtonPos model =
    let
        ( w, h ) =
            wh model
        (dpX, dpY) = 
            if model.player /= None then
                ( w / 10, h / 2 )
            else
                case model.mode of
                    GameOver _ ->
                        ( w / 2, h / 2 )

                    Stopped ->
                        ( w / 10, h / 2 )

                    Tick ->
                        ( -1000, 0 )

    in
    if model.resetGesture == Touch.blanco then
        (dpX, dpY)
    else 
        let dx = Touch.deltaX model.resetGesture 
        in (dpX + Maybe.withDefault 0 dx, dpY)


viewChallenge : Maybe a -> Svg msg
viewChallenge mbChallenge =
    case mbChallenge of
        Nothing ->
            g [] []

        Just challenge ->
            text_
                [ textAnchor "middle"
                , fontSize "60"
                , fontWeight "bold"
                , dominantBaseline "middle"
                , stroke "black"
                , strokeWidth "2"
                , fill "black"
                , transform <| translate ( 100, 100 )
                ]
                [ text <| toString challenge ]



-- half the screen


viewTimer : Float -> ( Float, Float ) -> Model -> Timer -> Svg.Svg Msg
viewTimer rot pos model timer =
    let
        isActive =
            case model.mode of
                GameOver _ ->
                    False

                _ ->
                    timer.player == model.player || model.player == None
    in
    g
        [ transform <|
            translate pos
                ++ " rotate("
                ++ toString rot
                ++ ")"
        ]
        [ text_
            [ textAnchor "middle"
            , fontSize "120"
            , fontWeight "bold"
            , dominantBaseline "middle"
            , stroke "black"
            , strokeWidth "2"
            , opacity
                (if isActive then
                    "1"
                 else
                    "0.5"
                )
            , fill
                (if isActive then
                    "black"
                 else
                    "grey"
                )
            ]
            [ text <| timeToString timer.time ]
        , tapRect isActive
            pos
            model
            timer.player
        ]


timeToString : Time -> String
timeToString time =
    let
        s =
            Time.format "%M:%S" (abs time)
    in
    if time < 0 then
        "-" ++ s
    else
        s


tapRect : Bool -> ( Float, Float ) -> Model -> Player -> Svg Msg
tapRect isActive ( posX, posY ) model player =
    let
        ( w, h ) =
            ( toFloat model.size.width, toFloat model.size.height / 2 )

        backgroundColor =
            case model.mode of
                GameOver loser ->
                    if loser == player then
                        "red"
                    else
                        "green"

                _ ->
                    "transparent"
    in
    rect
        ([ x <| toString (-w / 2)
         , y <| toString (-h / 2)
         , width <| toString w
         , height <| toString h
         , stroke
            (if isActive then
                "black"
             else
                "none"
            )
         , strokeWidth "1"
         , fill backgroundColor
         , opacity "0.1"
         ]
            ++ (if isActive then
                    [ Touch.onStart (\event -> Tapped player) ]
                else
                    []
               )
        )
        []



-- pause button


viewResetButton : ( Float, Float ) -> Model -> Svg Msg
viewResetButton pos model =
    let
        ( w, h ) =
            ( 72, 72 )
    in
    g
        [ transform <| translate pos
        ]
        [ Svg.image
            [ x <| toString (-w / 2)
            , y <| toString (-h / 2)
            , width <| toString w
            , height <| toString h
            , xlinkHref "img/restart.svg"
            , Touch.onStart ResetSwipe
            , Touch.onMove ResetSwipe
            , Touch.onEnd ResetSwipeEnd
            ]
            []
        ]


viewButton : Model -> Svg Msg
viewButton model =
    let
        ( w, h ) =
            ( 66, 60 )
    in
    g
        [ transform <| translate ( toFloat model.size.width / 2, toFloat model.size.height / 2 )
        ]
        [ pause (model.mode == Stopped)
            model.config.challenge
            (Maybe.withDefault 0 <| model.challenge)
        , rect
            [ x <| toString (-w / 2)
            , y <| toString (-h / 2)
            , width <| toString w
            , height <| toString h
            , fill "transparent"
            , Touch.onStart (\event -> Toggle)
            ]
            []
        ]


pause : Bool -> Float -> Float -> Svg Msg
pause stopped challengeSecs secsLeft =
    let
        half =
            challengeSecs / 2

        c1 =
            Basics.min half secsLeft / half

        c2 =
            if c1 >= 1 then
                (secsLeft - half) / half
            else
                0
    in
    g []
        [ bar stopped c1 ( -20, 0 ) ( 26, 60 )
        , bar stopped c2 ( 20, 0 ) ( 26, 60 )
        ]


bar : Bool -> Float -> ( Float, Float ) -> ( Float, Float ) -> Svg Msg
bar stopped secsPerc ( posX, posY ) ( w, h ) =
    g [ transform <| translate ( posX, posY ) ]
        [ rect
            [ x <| toString (-w / 2)
            , y <| toString (-h / 2)
            , width <| toString w
            , height <| toString h
            , fill <|
                if stopped then
                    "red"
                else
                    "grey"
            , stroke "black"
            ]
            []
        , rect
            [ x <| toString (-w / 2)
            , y <| toString (-h / 2)
            , width <| toString w
            , height <| toString (h * secsPerc)
            , fill <|
                if stopped then
                    "none"
                else
                    "orange"
            , stroke "none"
            ]
            []
        ]


translate : ( a, b ) -> String
translate ( posX, posY ) =
    "translate(" ++ toString posX ++ "," ++ toString posY ++ ")"
