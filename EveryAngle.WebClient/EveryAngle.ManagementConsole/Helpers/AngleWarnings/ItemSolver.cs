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
}