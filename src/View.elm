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
                    [ viewButton (model.mode == Stopped) ( w / 2, h / 2 ) ]
                else
                    []
               )
        )



-- half the screen


viewTimer : ( Float, Float ) -> ( Float, Float ) -> Float -> Bool -> Timer -> Svg.Svg Msg
viewTimer ( posX, posY ) ( w, h ) rot isActive timer =
    g [ transform <| "translate(" ++ toString posX ++ "," ++ toString posY ++ ") rotate(" ++ toString rot ++ ")" ]
        [ text_
            [ textAnchor "middle"
            , fontSize "120"
            , fontWeight "bold"
            , stroke "white"
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
                    [ Touch.onEnd (\event -> Tapped player) ]
                else
                    []
               )
        )
        []



-- pause button


viewButton : Bool -> ( Float, Float ) -> Svg Msg
viewButton stopped ( posX, posY ) =
    let
        ( w, h ) =
            ( 66, 60 )
    in
    g
        [ transform <| "translate(" ++ toString posX ++ "," ++ toString posY ++ ")"
        ]
        [ pause stopped
        , rect
            [ x <| toString (-w / 2)
            , y <| toString (-h / 2)
            , width <| toString w
            , height <| toString h
            , fill "transparent"
            , Touch.onEnd (\event -> Toggle)
            ]
            []
        ]


pause : Bool -> Svg Msg
pause stopped =
    g []
        [ bar stopped ( -20, 0 ) ( 26, 60 )
        , bar stopped ( 20, 0 ) ( 26, 60 )
        ]


bar : Bool -> ( Float, Float ) -> ( Float, Float ) -> Svg Msg
bar stopped ( posX, posY ) ( w, h ) =
    rect
        [ x <| toString (-w / 2)
        , y <| toString (-h / 2)
        , width <| toString w
        , height <| toString h
        , transform <| "translate(" ++ toString posX ++ "," ++ toString posY ++ ")"
        , fill <|
            if stopped then
                "red"
            else
                "grey"
        , stroke "black"
        , Touch.onEnd (\event -> Toggle)
        ]
        []
