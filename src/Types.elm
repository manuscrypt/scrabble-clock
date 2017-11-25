module Types exposing (..)

import Time exposing (Time)
import Touch
import Window exposing (Size)


type alias TimerConfig =
    { duration : Seconds
    , overtime : Seconds
    , challenge : Seconds
    , sound : Bool
    }


type StoppedMode
    = Pause
    | Settings
    | GameOver Player


type Mode
    = Stopped StoppedMode
    | Tick


type Player
    = None
    | PlayerOne
    | PlayerTwo


type alias Timer =
    { player : Player
    , time : Time
    }


type alias Model =
    { playerOne : Timer
    , playerTwo : Timer
    , player : Player
    , mode : Mode
    , config : TimerConfig
    , size : Size
    , challenge : Maybe Time
    , resetGesture : Touch.Gesture
    , resetButtonPos : ( Float, Float )
    }


type TimeSetting
    = Duration Seconds
    | Overtime Seconds
    | Challenge Seconds


type Setting
    = TimeSetting TimeSetting
    | Sound


type Msg
    = Tapped Player
    | Toggle
    | ResetSwipe Touch.Event
    | ResetSwipeEnd Touch.Event
    | TickSecond Time
    | SizeChanged Size
    | ShowSettings Touch.Event
    | TimeSettingChanged TimeSetting
    | SoundSettingChanged
    | SaveSettings


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
    , sound = True
    }


overtimeConfig : TimerConfig
overtimeConfig =
    { duration = 1 * Time.second
    , overtime = 2 * Time.second
    , challenge = 2 * Time.second
    , sound = True
    }
