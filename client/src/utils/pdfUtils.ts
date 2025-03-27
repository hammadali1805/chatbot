import jsPDF from 'jspdf';
import { Note as ContextNote } from '../context/AppContext';
import { Note as ApiNote } from '../services/noteService';

// Create a union type to handle both note formats
type GenericNote = {
  id?: string;
  _id?: string;
  title: string;
  content: string;
  createdAt: string | Date;
  category?: string;
  tags?: string[];
};

// Generate PDF from a note
export const generateNotePDF = (note: GenericNote): void => {
  // Create new jsPDF instance
  const doc = new jsPDF();
  
  // Set title
  doc.setFontSize(20);
  doc.text(note.title, 20, 20);
  
  // Add creation date
  doc.setFontSize(12);
  const createdAtString = typeof note.createdAt === 'string' 
    ? note.createdAt 
    : new Date(note.createdAt).toLocaleDateString();
  doc.text(`Created on: ${createdAtString}`, 20, 30);
  
  // Add category and tags if present
  let yPos = 40;
  if (note.category) {
    doc.text(`Category: ${note.category}`, 20, yPos);
    yPos += 10;
  }
  
  if (note.tags && note.tags.length > 0) {
    doc.text(`Tags: ${note.tags.join(', ')}`, 20, yPos);
    yPos += 10;
  }
  
  // Add content with word wrapping
  doc.setFontSize(14);
  const textLines = doc.splitTextToSize(note.content, 170);
  doc.text(textLines, 20, yPos);
  
  // Save PDF with the note title as filename
  doc.save(`${note.title.replace(/\s+/g, '_')}.pdf`);
};

// Generate PDF from a study plan
export const generateStudyPlanPDF = (studyPlan: any): void => {
  // Create new jsPDF instance
  const doc = new jsPDF();
  
  // Set title
  doc.setFontSize(20);
  doc.text(studyPlan.title, 20, 20);
  
  // Add creation date
  doc.setFontSize(12);
  doc.text(`Created on: ${studyPlan.createdAt}`, 20, 30);
  doc.text(`Progress: ${studyPlan.progress}%`, 20, 40);
  
  // Add tasks
  doc.setFontSize(16);
  doc.text('Tasks:', 20, 50);
  
  let yPosition = 60;
  studyPlan.tasks.forEach((task: any, index: number) => {
    const status = task.completed ? '[✓]' : '[ ]';
    doc.setFontSize(14);
    doc.text(`${status} ${task.title}`, 20, yPosition);
    yPosition += 10;
  });
  
  // Save PDF with the study plan title as filename
  doc.save(`${studyPlan.title.replace(/\s+/g, '_')}_plan.pdf`);
};

// Generate PDF from a quiz
export const generateQuizPDF = (quiz: any): void => {
  // Create new jsPDF instance
  const doc = new jsPDF();
  
  // Set title
  doc.setFontSize(20);
  doc.text(quiz.title, 20, 20);
  
  // Add creation date and topic
  doc.setFontSize(12);
  doc.text(`Topic: ${quiz.topic}`, 20, 30);
  doc.text(`Created on: ${quiz.createdAt}`, 20, 40);
  
  if (quiz.status === 'completed' && quiz.score !== undefined) {
    doc.text(`Score: ${quiz.score}%`, 20, 50);
  }
  
  // Add questions
  let yPosition = 60;
  quiz.questions.forEach((question: any, qIndex: number) => {
    doc.setFontSize(14);
    doc.text(`Question ${qIndex + 1}: ${question.question}`, 20, yPosition);
    yPosition += 10;
    
    // Add options
    question.options.forEach((option: any, oIndex: number) => {
      const prefix = option.isCorrect ? '✓' : ' ';
      doc.setFontSize(12);
      doc.text(`${prefix} ${option.text}`, 30, yPosition);
      yPosition += 8;
    });
    
    yPosition += 5; // Add space between questions
  });
  
  // Save PDF with the quiz title as filename
  doc.save(`${quiz.title.replace(/\s+/g, '_')}_quiz.pdf`);
}; 