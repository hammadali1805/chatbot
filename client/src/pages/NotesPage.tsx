import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { PlusIcon, DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import { noteService, Note } from '../services/noteService';
import NoteForm from '../components/forms/NoteForm';

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const data = await noteService.getAllNotes();
        setNotes(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleCreateNote = () => {
    setShowNoteForm(true);
    setSelectedNoteId(null);
  };

  const handleEditNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setShowNoteForm(true);
  };

  const handleViewNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setShowNoteForm(false);
  };

  const handleExportNote = (note: Note) => {
    // Create a text file with the note content
    const element = document.createElement('a');
    const file = new Blob([
      `# ${note.title}\n\n${note.content}\n\nTags: ${note.tags?.join(', ') || ''}\nCreated: ${new Date(note.createdAt).toLocaleDateString()}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAddNote = async (noteData: any) => {
    try {
      setIsLoading(true);
      const newNote = await noteService.createNote(noteData);
      setNotes([newNote, ...notes]);
      setShowNoteForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: string, noteData: any) => {
    try {
      setIsLoading(true);
      const updatedNote = await noteService.updateNote(noteId, noteData);
      setNotes(notes => notes.map(n => n._id === noteId ? updatedNote : n));
      setShowNoteForm(false);
      setSelectedNoteId(null);
      setError(null);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteService.deleteNote(noteId);
      setNotes(notes => notes.filter(n => n._id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
        setShowNoteForm(false);
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    }
  };

  // Render the note details view
  const renderNoteDetails = () => {
    if (!selectedNoteId) return null;
    
    const note = notes.find(n => n._id === selectedNoteId);
    if (!note) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-blue-700">{note.title}</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportNote(note)}
              className="flex items-center gap-1"
            >
              <DownloadIcon size={16} /> Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditNote(note._id)}
              className="flex items-center gap-1"
            >
              Edit Note
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedNoteId(null)}
            >
              Back to List
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteNote(note._id)}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Delete
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">Created on {new Date(note.createdAt).toLocaleDateString()}</p>
        
        {note.tags && note.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {note.tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{note.content}</p>
        </div>
      </div>
    );
  };

  if (isLoading && notes.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
            <Button 
              variant="default" 
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCreateNote}
            >
              <PlusIcon size={18} className="mr-2" /> Create New Note
            </Button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {showNoteForm ? (
            <NoteForm
              note={selectedNoteId ? notes.find(n => n._id === selectedNoteId) : undefined}
              onSubmit={selectedNoteId 
                ? (data) => handleUpdateNote(selectedNoteId, data)
                : handleAddNote
              }
              onCancel={() => {
                setShowNoteForm(false);
                setSelectedNoteId(null);
              }}
            />
          ) : selectedNoteId ? (
            renderNoteDetails()
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Notes</h2>

              {notes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-500">
                    No notes yet. Create one to get started!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.map((note) => (
                    <Card 
                      key={note._id} 
                      className="overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xl font-semibold text-blue-700 truncate">{note.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <CardContent className="p-6">
                        {note.tags?.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {note.tags.map((tag, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-gray-700 line-clamp-3 mb-4">{note.content}</p>
                      </CardContent>

                      <CardFooter className="bg-gray-50 px-6 py-4 flex justify-between">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteNote(note._id)}
                          className="bg-red-600 hover:bg-red-700 text-white border-0"
                        >
                          Delete
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewNote(note._id)}
                          className="flex items-center gap-1"
                        >
                          <ExternalLinkIcon size={16} /> View
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NotesPage; 