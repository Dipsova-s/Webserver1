using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using System;

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

        //This is one Excel input line
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

            //The order is meant for determining if a field has been changed in a later version
            // So: In 2019    Field A was changed into Field B
            //     In 2020    Field B was changed into Field C
            //     In 2020SP4 Field C was changed into Field D
            //     In 2020SP5 Field D was changed into Field E

            // Method CheckIfFieldHasChangedAgainInLaterReleases then changes the contentinput for the 2019 field:
            // OldField = Field A, new field is Field C
            SetOrder();
        }

        public AngleWarningsContentInput()
        {
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
}