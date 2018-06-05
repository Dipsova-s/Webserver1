using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EveryAngle.ManagementConsole.Models
{
    public enum PopupChooserButtonType
    {
        Button,
        Input
    }

    public class PopupChooserButtonModel
    {
        private PopupChooserButtonType buttonType = PopupChooserButtonType.Button;
        public PopupChooserButtonType ButtonType
        {
            get { return buttonType; }
            set { buttonType = value; }
        }

        public string Target { get; set; }

        public string Caption { get; set; }

        public string PopupTitle { get; set; }

        public string OnClick { get; set; }

        public string ClassName { get; set; }

        public string Attributes { get; set; }

        private int width = 1000;
        public int Width
        {
            get { return width; }
            set { width = value; }
        }

        private int minWidth = 400;
        public int MinWidth
        {
            get { return minWidth; }
            set { minWidth = value; }
        }

        private int height = 600;
        public int Height
        {
            get { return height; }
            set { height = value; }
        }

        private int minHeight = 400;
        public int MinHeight
        {
            get { return minHeight; }
            set { minHeight = value; }
        }
    }
}