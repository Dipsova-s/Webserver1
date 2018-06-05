using EveryAngle.Shared.Globalization;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace EveryAngle.Core.ViewModels
{
    public class LocalizedDisplayNameAttribute : DisplayNameAttribute
    {
        private readonly DisplayAttribute display;
        public LocalizedDisplayNameAttribute(string resourceName)
        {
            this.display = new DisplayAttribute
            {
                ResourceType = typeof(Resource),
                Name = resourceName
            };
        }

        public override string DisplayName
        {
            get
            {
                return Resource.ResourceManager.GetString(display.Name);
            }
        }
    }
}
