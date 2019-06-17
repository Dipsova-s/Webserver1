using EveryAngle.Shared.Globalization;

namespace EveryAngle.ManagementConsole.Helpers.Controls
{
    public class PackageHelper
    {
        private const string EXTENSION = "eapackage";

        public virtual string Source { get; set; }
        public virtual string Name { get; set; }
        public virtual string Version { get; set; }
        public virtual string ErrorMessage { get; set; }

        public override string ToString()
        {
            return string.Format("{0}-{1}-{2}.{3}", Source, Name, Version, EXTENSION);
        }

        public static PackageHelper Parse(string filename)
        {
            // remove the extension 
            var dotIndex = filename.LastIndexOf('.');
            string name = filename.Remove(dotIndex, filename.Length - dotIndex);
            string[] parts = name.Split('-');

            var output = new PackageHelper();
            if (parts.Length > 0)
                output.Source = parts[0];

            if (parts.Length > 1)
                output.Name = parts[1];

            if (parts.Length > 2)
                output.Version = parts[2];

            return output;
        }

        //Show error for each case
        public bool IsValid()
        {
            if (Name == null)
            {
                ErrorMessage = Resource.MC_PackageNameMustBeSpecified;
                return false;
            }

            if (Source == null)
            {
                ErrorMessage = Resource.MC_PackageSourceMustBeSpecified;
                return false;
            }

            if (Version == null)
            {
                ErrorMessage = Resource.MC_PackageVersionMustBeSpecified;
                return false;
            }

            if (ToString().Trim().Contains(" "))
            {
                ErrorMessage = Resource.MC_PackageFilenameCannotContainWhitespace;
                return false;
            }

            return true;
        }
    }
}
