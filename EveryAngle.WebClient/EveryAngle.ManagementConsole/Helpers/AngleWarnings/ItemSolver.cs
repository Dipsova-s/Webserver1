using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public class ItemSolver : AngleWarningsContentInput
    {
        public ItemSolver()
        {
        }

        public ItemSolver(WarningFix fix, string version, string objectClass, string fieldToReplace, string newField) : base(fix, version, objectClass, fieldToReplace, newField)
        {
        }
    }

    // Dennis: i do not want this to be derived from AngleWarningsContentInput
    // ItemSolver is meant to be given to the angle warnings tool api as is.
    // For now:
    //fix = fix
    //objectClass = object angle warnings tool api expects
    //fieldToReplace = the old field that gave a warning
    //newField = new field to replace old field (including if needed __ (so: Material__Description)
    //
    //
}