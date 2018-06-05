using System.ComponentModel;

namespace EveryAngle.WebClient.Domain
{
    public class EveryAngleEnums
    {
        /// <summary>
        /// Sub5 using capitalization 
        /// </summary>

        public enum FIELDTYPE
        {
            [DescriptionAttribute("text")]
            TEXT = 1,
            [DescriptionAttribute("enumerated")]
            ENUMERATED = 2,
            [DescriptionAttribute("boolean")]
            BOOLEAN = 3,
            [DescriptionAttribute("date")]
            DATE = 4,
            [DescriptionAttribute("double")]
            DOUBLE = 5,
            [DescriptionAttribute("int")]
            INT = 6,
            [DescriptionAttribute("currency")]
            CURRENCY = 7,
            [DescriptionAttribute("percentage")]
            PERCENTAGE = 8,
            [DescriptionAttribute("period")]
            PERIOD = 9,
            [DescriptionAttribute("string")]
            STRING = 10,
            [DescriptionAttribute("number")]
            NUMBER = 11,
            [DescriptionAttribute("time")]
            TIME = 12,
            [DescriptionAttribute("invalid")]
            INVALID = 13,
            [DescriptionAttribute("datetime")]
            DATETIME = 14,
            [DescriptionAttribute("timespan")]
            TIMESPAN = 15
        }

    }
}
