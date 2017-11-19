module Types exposing (..)

import Time exposing (Time)
import Window exposing (Size)


type alias Model =
    { playerOne : Timer
    , playerTwo : Timer
    , player : Player
    , mode : Mode
    , config : TimerConfig
    , size : Size
    , challenge : Maybe Time
    }


type Msg
    = Tapped Player
    | Toggle
    | TickSecond Time
    | SizeChanged Size


type alias Seconds =
    Float


minutes : Float -> Float
minutes =
    (*) 60 << (*) Time.second


defaultConfig : TimerConfig
defaultConfig =
    { duration = minutes 25
    , overtime = minutes 10
    , challenge = 20 * Time.second
    }


type alias TimerConfig =
    { duration : Seconds
    , overtime : Seconds
    , challenge : Seconds
    }


type Mode
    = Stopped
    | Tick


type Player
    = None
    | PlayerOne
    | PlayerTwo


type alias Timer =
    { player : Player
    , time : Time
    }
