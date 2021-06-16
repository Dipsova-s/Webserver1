using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using System;
using System.ComponentModel;

namespace EveryAngle.ManagementConsole.Helpers
{
    public class AngleWarningsContentInput : IAngleWarningsContentInput
    {
        public WarningFix Fix;
        public string ObjectClass;
        public string FieldOrClassToReplace;
        public string NewFieldOrClass;
        public string Version;

        public int Order;

        public AngleWarningsContentInput(WarningFix fix, string version, string objectClass, string fieldToReplace, string newField)
        {
            if (string.IsNullOrEmpty(version))
            {
                throw new ArgumentException("should not be empty", nameof(version));
            }

            if (string.IsNullOrEmpty(objectClass))
            {
                throw new ArgumentException("should not be empty", nameof(objectClass));
            }

            if (string.IsNullOrEmpty(fieldToReplace))
            {
                throw new ArgumentException("should not be empty", nameof(fieldToReplace));
            }

            if (string.IsNullOrEmpty(newField))
            {
                throw new ArgumentException("should not be empty", nameof(newField));
            }

            Fix = fix;
            Version = version;
            ObjectClass = objectClass;
            FieldOrClassToReplace = fieldToReplace;
            NewFieldOrClass = newField;

            SetOrder();
        }

        public AngleWarningsContentInput()
        {
        }

        public string GetClassOrFieldToReplaceString()
        {
            return $"{ObjectClass}__{FieldOrClassToReplace}";
        }

        public string GetNewFieldString(string startObject)
        {
            return ObjectClass.Equals(startObject, StringComparison.CurrentCultureIgnoreCase)
                ? NewFieldOrClass
                : $"{ObjectClass}__{NewFieldOrClass}";
        }

        private void SetOrder()
        {
            EAVersion eaVersion;

            try
            {
                eaVersion = (EAVersion)Enum.Parse(typeof(EAVersion), Version);
            }
            catch
            {
                throw new InvalidOperationException("Invalid EA version found.");
            }

            Order = (int)eaVersion;
        }

    }

    public enum WarningFix
    {
        ReplaceField,
        ReplaceClass,
        ReplaceReference,
        ReplaceSublist,
        NotSupportedMethod
    }

    public enum EAVersion
    {
        [Description("R2018")] R2018 = 180,
        [Description("R2019")] R2019 = 190,
        [Description("R2020")] R2020 = 200,
        [Description("R2020SP1")] R2020SP1 = 201,
        [Description("R2020SP2")] R2020SP2 = 202,
        [Description("R2020SP3")] R2020SP3 = 203,
        [Description("R2020SP4")] R2020SP4 = 204,
        [Description("R2020SP5")] R2020SP5 = 205,
    }
   
}