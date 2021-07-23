using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using Newtonsoft.Json.Linq;

namespace EveryAngle.ManagementConsole.Helpers
{
    public interface IAngleWarningsContentInputter
    {
        bool TryReadInputList();
        ItemSolver GetSolveItem(string warning, string objectClass, string field, string jump);
    }
}