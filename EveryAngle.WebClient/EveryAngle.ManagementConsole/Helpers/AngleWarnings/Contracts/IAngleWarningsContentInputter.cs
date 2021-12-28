using EveryAngle.ManagementConsole.Helpers.AngleWarnings;

namespace EveryAngle.ManagementConsole.Helpers
{
    public interface IAngleWarningsContentInputter
    {
        void Initialize(string fieldSourcesUri, string classesUri);
        bool TryReadInputColumnHeaders(string filePath);
        bool TryReadInputList();
        ItemSolver GetSolveItem(string warning, string objectClass, string field, string jump);
    }
}