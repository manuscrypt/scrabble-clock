module Types exposing (..)

import Time exposing (Time)
import Window exposing (Size)
import Touch

type alias Model =
    { playerOne : Timer
    , playerTwo : Timer
    , player : Player
    , mode : Mode
    , config : TimerConfig
    , size : Size
    , challenge : Maybe Time
    , resetGesture : Touch.Gesture
    }


type Msg
    = Tapped Player
    | Toggle
    | ResetSwipe Touch.Event
    | ResetSwipeEnd Touch.Event
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


overtimeConfig : TimerConfig
overtimeConfig =
    { duration = 1 * Time.second
    , overtime = 2 * Time.second
    , challenge = 2 * Time.second
    }


type alias TimerConfig =
    { duration : Seconds
    , overtime : Seconds
    , challenge : Seconds
    }


type Mode
    = Stopped
    | Tick
    | GameOver Player


type Player
    = None
    | PlayerOne
    | PlayerTwo


type alias Timer =
    { player : Player
    , time : Time
    }
