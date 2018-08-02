using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EveryAngle.ManagementConsole.Models
{
    public class PageToolbarButtonModel
    {
        public PageToolbarButtonType Type { get; set; }
        public string Label { get; set; }
        public string Link { get; set; }
        public string OnClick { get; set; }
        public string CssClass { get; set; }
        public object Data { get; set; }
        public PrivilegeType Privilege { get; set; }
        public string ModelUri { get; set; }
        public string UserUri { get; set; }
        public string Attributes { get; set; }
        public string EnableTemplate { get; set; }
        public string DisableTemplate { get; set; }
        public string Template { get; set; }
        public ButtonMode Mode { get; set; }
        public bool IsTaskOwner { get; set; }

    }

    public enum PageToolbarButtonType
    {
        Save,
        Reload,
        Cancel,
        Custom,
        Add,
        GridEditDelete,
        Upload,
        Create
    }

    public enum PrivilegeType
    {
        None,
        System,
        Model,
        User,
        SystemAndModel,
        ScheduleTask

    }

    public enum ButtonMode
    {
        None,
        Create,
        Edit
    }

}
