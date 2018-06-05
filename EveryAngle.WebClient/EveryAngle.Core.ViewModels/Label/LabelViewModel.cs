using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Label
{
    public class LabelViewModel : ICloneable
    {
        public virtual string id { get; set; }

        public virtual string Uri { get; set; }

        public virtual string name { get; set; }

        public virtual string category { get; set; }

        public virtual List<MultilingualLabel> multi_lang_name { get; set; }

        public virtual string abbreviation { get; set; }

        public virtual bool enabled { get; set; }

        public virtual bool system { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }

    public class MultilingualLabel
    {
        public virtual string lang { get; set; }

        public virtual string text { get; set; }
    }

    public class LabelDtoViewModel
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string Abbreviation { get; set; }

        public string Authorization { get; set; }

        public List<LabelDtoViewModel> Items { get; set; }

        public int? ParentFakeId { get; set; }

        public int FakeId { get; set; }

        public bool hasChildren { get; set; }

    }
}
