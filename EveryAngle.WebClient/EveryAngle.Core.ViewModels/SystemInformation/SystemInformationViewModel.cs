using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.SystemInformation
{
    public class SystemInformationViewModel
    {
        public virtual string uri { get; set; }

        public virtual string system_version { get; set; }

        public virtual string up_since { get; set; }

        public virtual List<SystemLanguages> languages { get; set; }

        public virtual List<CurrenciesInformation> currencies { get; set; }

        [JsonProperty(PropertyName = "features")]
        public List<FeatureViewModel> features { get; set; }

        /// <summary>
        /// Can use Angle automation or not?
        /// </summary>
        public virtual bool AngleAutomation
        {
            get
            {
                return features != null && features.Exists(x => x.feature.Equals("AngleAutomation") && bool.Equals(true, x.licensed));
            }
        }

        /// <summary>
        /// Can use OData service or not?
        /// </summary>
        public virtual bool ODataService
        {
            get
            {
                return features != null && features.Exists(x => x.feature.Equals("ODataService") && bool.Equals(true, x.licensed));
            }
        }
    }

    public class SystemLanguages
    {
        public virtual string id { get; set; }

        public virtual string name { get; set; }

        public virtual bool enabled { get; set; }
    }

    public class CurrenciesInformation
    {
        public virtual string currency { get; set; }

        public virtual string currency_symbol { get; set; }

        public virtual string currency_description { get; set; }
    }

}
