using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using EveryAngle.Core.ViewModels.Label;

namespace EveryAngle.Core.ViewModels.LabelCategory
{
    public class LabelCategoryViewModel : ICloneable
    {
        public virtual string id { get; set; }

        public virtual string uri { get; set; }

        public virtual string name { get; set; }

        public virtual List<MultilingualLabelCategory> multi_lang_name { get; set; }

        public virtual string description { get; set; }

        public virtual List<MultilingualLabelCategory> multi_lang_description { get; set; }

        public virtual bool contains_businessprocesses { get; set; }

        [LocalizedDisplayName("MC_CategoryValidForPrivilege")]
        public virtual bool used_for_authorization { get; set; }

        [LocalizedDisplayName("MC_RequiredAnglePublishing")]
        public virtual bool is_required { get; set; }

        public virtual int order { get; set; }

        public virtual string labels { get; set; }

        public string labelsID { get; set; }

        public virtual List<ActiveModels> models { get; set; }

        public bool activeForModel { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }

    public class MultilingualLabelCategory
    {
        public string lang { get; set; }

        public string text { get; set; }
    }

    public class ActiveModels
    {
        public string model { get; set; }

        public bool used_for_authorization { get; set; }

        public bool is_required { get; set; }
    }

    
}
