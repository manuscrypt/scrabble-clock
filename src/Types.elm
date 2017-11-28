module Types exposing (..)

import Data exposing (Seconds, TimerConfig)
import Time exposing (Time)
import Touch
import Window exposing (Size)


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
