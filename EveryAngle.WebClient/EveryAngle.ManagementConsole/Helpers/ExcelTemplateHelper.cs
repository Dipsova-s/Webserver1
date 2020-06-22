using EveryAngle.Shared.Globalization;

namespace EveryAngle.ManagementConsole.Helpers
{
    public class ExcelTemplateHelper
    {
        public virtual string Name { get; set; }
        public virtual string ErrorMessage { get; set; }

        public static ExcelTemplateHelper Parse(string filename)
        {
            // remove the extension 
            var dotIndex = filename.LastIndexOf('.');
            string name = filename.Remove(dotIndex, filename.Length - dotIndex);
            var output = new ExcelTemplateHelper();
            
            if (name.Length > 0)
                output.Name = name;
            
            return output;
        }

        //Show error for each case
        public bool IsValid()
        {
            if (Name == null)
            {
                ErrorMessage = Resource.MC_ExcelFilenameCannotBeNull;
                return false;
            }
            if (Name.Trim().Contains(" "))
            {
                ErrorMessage = Resource.MC_InvalidExcelFileName;
                return false;
            }

            return true;
        }
    }
}