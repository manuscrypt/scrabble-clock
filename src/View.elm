module View exposing (..)

import Svg exposing (Svg, g, path, rect, svg, text, text_)
import Svg.Attributes exposing (..)
import Time.Format as Time
import Touch
import Types exposing (..)


type alias Pos =
    ( Float, Float )


view : Model -> Svg Msg
view model =
    let
        { width, height } =
            model.size

        ( w, h ) =
            ( toFloat width, toFloat height )

        posOne =
            ( w / 2, h / 4 )

        posTwo =
            ( w / 2, 3 * h / 4 )
    in
    svg [ viewBox <| "0 0 " ++ toString width ++ " " ++ toString height ]
        ([ viewTimer posOne ( w, h / 2 ) 180 (model.player == None || model.player == PlayerOne) model.playerOne
         , viewTimer posTwo ( w, h / 2 ) 0 (model.player == None || model.player == PlayerTwo) model.playerTwo
         ]
            ++ (if model.player /= None then
                    let
                        secsLeft =
                            Maybe.withDefault 0 <| model.challenge
                    in
                    [ viewButton (model.mode == Stopped) model.config.challenge secsLeft ( w / 2, h / 2 ) ]
                else
                    []
               )
        )


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


viewTimer : ( Float, Float ) -> ( Float, Float ) -> Float -> Bool -> Timer -> Svg.Svg Msg
viewTimer ( posX, posY ) ( w, h ) rot isActive timer =
    g [ transform <| "translate(" ++ toString posX ++ "," ++ toString posY ++ ") rotate(" ++ toString rot ++ ")" ]
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
            [ text <| Time.format "%M:%S" timer.time ]
        , tapRect isActive ( posX, posY ) ( w, h ) timer.player
        ]


tapRect : Bool -> ( Float, Float ) -> ( Float, Float ) -> Player -> Svg Msg
tapRect isActive ( posX, posY ) ( w, h ) player =
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
         , fill "transparent"
         ]
            ++ (if isActive then
                    [ Touch.onStart (\event -> Tapped player) ]
                else
                    []
               )
        )
        []



-- pause button


viewButton : Bool -> Float -> Float -> ( Float, Float ) -> Svg Msg
viewButton stopped challengeSecs secsLeft ( posX, posY ) =
    let
        ( w, h ) =
            ( 66, 60 )
    in
    g
        [ transform <| translate ( posX, posY )
        ]
        [ pause stopped challengeSecs secsLeft
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
