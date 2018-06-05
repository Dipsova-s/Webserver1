using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Comment;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface ICommentService
    {
        ListViewModel<CommentViewModel> GetCommentsByType(string uri);

        CommentViewModel AddComment(string commentsUri, string comment);

        void DeleteComment(string uri);

        CommentViewModel UpdateComment(string uri, string comment);
    }
}
