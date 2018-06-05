using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Angle
{
    public class AreaCoordinate
    {
        public string Name { get; set; }
        public List<int> Coordinate { get; set; }
        public string ClassId { get; set; }
        public string TemplateId { get; set; }
        public Style AreaStyle { get; set; }
        public string ParentName { get; set; }
        public string CSSClass { get; set; }
        public string AreaType { get; set; }
        public string Label { get; set; }
        public bool IsValidTemplateId { get; set; }
        public bool IsValidHelptextId { get; set; }
    }

    public class Style
    {
        private String textAlign = string.Empty;
        public String TextAlignment
        {
            get
            {
                return textAlign.ToLowerInvariant();
            }
            set
            {
                textAlign = value;
            }
        }

        private String verticalAlignment = string.Empty;
        public String VerticalAlignment
        {
            get
            {
                return verticalAlignment.ToLowerInvariant();
            }
            set
            {
                verticalAlignment = value;
            }
        }

        private String fontWeight = string.Empty;
        public String FontWeight
        {
            get
            {
                return fontWeight.ToLowerInvariant();
            }
            set
            {
                fontWeight = value;
            }
        }

        private String fontSize = string.Empty;
        public String FontSize
        {
            get
            {
                return fontSize.ToLowerInvariant();
            }
            set
            {
                fontSize = value;
            }
        }

        private String textColor = string.Empty;
        public String TextColor
        {
            get
            {
                return textColor.ToLowerInvariant();
            }
            set
            {
                textColor = value;
            }
        }

        private String textSize = TextVersion.Short.ToString();
        public String TextSize
        {
            get
            {
                return textSize.ToLowerInvariant();
            }
            set
            {
                textSize = value;
            }
        }

        private String borderColor = "#ffffff";
        public String BorderColor
        {
            get
            {
                return borderColor.ToLowerInvariant();
            }
            set
            {
                borderColor = value;
            }
        }

        private string padding = string.Empty;
        public string Padding
        {
            get
            {
                return padding.ToLowerInvariant();
            }
            set
            {
                padding = value;
            }
        }

        private string textShadow = string.Empty;
        public string TextShadow
        {
            get
            {
                return textShadow.ToLowerInvariant();
            }
            set
            {
                textShadow = value;
            }
        }
        
    }

    public enum TextAlign
    {
        Center = 0,
        Left = 1,
        Right = 2
    }

    public enum VerticalAlign
    {
        Top = 0,
        Middle = 1,
        Bottom = 2
    }

    public enum FontWeight
    {
        Normal = 0,
        Bold = 1
    }

    public enum FontSize
    {
        Small = 0,
        Normal = 1,
        Large = 2
    }

    public enum Color
    {
        EA_Color_Green = 0,
        EA_Color_Lightblue = 1,
        EA_Color_Orange = 2,
        EA_Color_Yellow = 3,
        EA_Color_PrupleGrey = 4,
        EA_Color_DarkBlue = 5,
        EA_Color_DarkBrown = 6,
        EA_Color_LightGrey = 7,
        EA_Color_White = 8,
        ETC = 9
    }

    public enum TextVersion
    {
        Short = 0,
        Long = 1
    }

}
