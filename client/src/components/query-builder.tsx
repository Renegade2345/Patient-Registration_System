import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { executeQuery, getSavedQueries, createSavedQuery, deleteSavedQuery } from '@/lib/localStorageDb';
import { downloadCsv, copyToClipboard } from '@/lib/utils';
import { Save, FolderOpen, AlignLeft, Play, Download, Clipboard, X } from 'lucide-react';
import type { SavedQuery } from '@shared/schema';

export function QueryBuilder() {
  const { toast } = useToast();
  const [query, setQuery] = useState(`SELECT * FROM patients 
WHERE date_of_birth < '2000-01-01' 
ORDER BY last_name ASC;`);
  const [results, setResults] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [newQueryName, setNewQueryName] = useState('');
  const [newQueryDescription, setNewQueryDescription] = useState('');
  const editorRef = useRef<HTMLPreElement>(null);
  
  useEffect(() => {
    loadSavedQueries();
  }, []);
  
  const loadSavedQueries = async () => {
    try {
      const queries = await getSavedQueries();
      setSavedQueries(queries);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load saved queries',
        variant: 'destructive',
      });
    }
  };
  
  const handleRunQuery = async () => {
    if (!query.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a SQL query',
        variant: 'destructive',
      });
      return;
    }
    
    setIsExecuting(true);
    
    try {
      const { results: queryResults, time, count } = await executeQuery(query);
      setResults(queryResults);
      setExecutionTime(time);
      
      toast({
        title: 'Query executed successfully',
        description: `${count} rows returned in ${time}s`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to execute query',
        variant: 'destructive',
      });
      setResults([]);
      setExecutionTime(0);
    } finally {
      setIsExecuting(false);
    }
  };
  
  const handleSaveQuery = async () => {
    if (!newQueryName.trim() || !query.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a name and a valid query',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await createSavedQuery({
        name: newQueryName,
        query: query,
        description: newQueryDescription,
      });
      
      await loadSavedQueries();
      setIsSaveDialogOpen(false);
      setNewQueryName('');
      setNewQueryDescription('');
      
      toast({
        title: 'Success',
        description: 'Query saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save query',
        variant: 'destructive',
      });
    }
  };
  
  const handleLoadQuery = (savedQuery: SavedQuery) => {
    setQuery(savedQuery.query);
    setIsLoadDialogOpen(false);
    
    toast({
      title: 'Query loaded',
      description: `Loaded query: ${savedQuery.name}`,
    });
  };
  
  const handleDeleteSavedQuery = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      await deleteSavedQuery(id);
      await loadSavedQueries();
      
      toast({
        title: 'Success',
        description: 'Query deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete query',
        variant: 'destructive',
      });
    }
  };
  
  const formatSqlQuery = () => {
    try {
      // Simple SQL formatter
      const formattedQuery = query
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ', ')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .replace(/\s*=\s*/g, ' = ')
        .replace(/\s*>\s*/g, ' > ')
        .replace(/\s*<\s*/g, ' < ')
        .replace(/\s*>=\s*/g, ' >= ')
        .replace(/\s*<=\s*/g, ' <= ')
        .replace(/\s*<>\s*/g, ' <> ')
        .replace(/SELECT/gi, 'SELECT\n  ')
        .replace(/FROM/gi, '\nFROM\n  ')
        .replace(/WHERE/gi, '\nWHERE\n  ')
        .replace(/ORDER BY/gi, '\nORDER BY\n  ')
        .replace(/GROUP BY/gi, '\nGROUP BY\n  ')
        .replace(/HAVING/gi, '\nHAVING\n  ')
        .replace(/LIMIT/gi, '\nLIMIT\n  ')
        .replace(/OFFSET/gi, '\nOFFSET\n  ')
        .replace(/UNION/gi, '\nUNION\n')
        .replace(/INNER JOIN/gi, '\nINNER JOIN\n  ')
        .replace(/LEFT JOIN/gi, '\nLEFT JOIN\n  ')
        .replace(/RIGHT JOIN/gi, '\nRIGHT JOIN\n  ')
        .replace(/JOIN/gi, '\nJOIN\n  ')
        .replace(/ON/gi, '\nON\n  ')
        .replace(/AND/gi, '\n  AND ')
        .replace(/OR/gi, '\n  OR ');
      
      setQuery(formattedQuery);
      
      toast({
        title: 'Success',
        description: 'Query formatted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to format query',
        variant: 'destructive',
      });
    }
  };
  
  const insertCommonQuery = (queryType: string) => {
    let templateQuery = '';
    
    switch (queryType) {
      case 'all-patients':
        templateQuery = `SELECT * FROM patients ORDER BY last_name ASC;`;
        break;
      case 'age-range':
        templateQuery = `SELECT * FROM patients 
WHERE date_of_birth BETWEEN '1970-01-01' AND '2000-01-01'
ORDER BY date_of_birth ASC;`;
        break;
      case 'registration-stats':
        templateQuery = `SELECT 
  COUNT(*) as total_patients,
  MIN(registration_date) as first_registration,
  MAX(registration_date) as last_registration
FROM patients;`;
        break;
      case 'patients-with-allergies':
        templateQuery = `SELECT p.id, p.first_name, p.last_name, p.date_of_birth, 
  a.name as allergy_name
FROM patients p
JOIN allergies a ON p.id = a.patient_id
ORDER BY p.last_name, p.first_name;`;
        break;
      default:
        templateQuery = '';
    }
    
    if (templateQuery) {
      setQuery(templateQuery);
      
      toast({
        title: 'Template inserted',
        description: 'Common query template inserted',
      });
    }
  };
  
  const exportResults = () => {
    if (results.length === 0) {
      toast({
        title: 'Error',
        description: 'No results to export',
        variant: 'destructive',
      });
      return;
    }
    
    downloadCsv(results, 'query_results.csv');
  };
  
  // Handle editor key events (e.g., Tab)
  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const editor = editorRef.current;
      if (!editor) return;
      
      // Get cursor position
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editor);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      
      // Insert spaces at cursor position
      const spaces = '  ';
      document.execCommand('insertText', false, spaces);
    }
  };
  
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-medium mb-4">SQL Query Builder</h2>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="block text-gray-700" htmlFor="sql-query">Write your SQL query:</label>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => setIsLoadDialogOpen(true)}
                >
                  <FolderOpen className="h-4 w-4 mr-1" />
                  <span>Load Query</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => setIsSaveDialogOpen(true)}
                >
                  <Save className="h-4 w-4 mr-1" />
                  <span>Save Query</span>
                </Button>
              </div>
            </div>
            <div className="relative">
              <pre
                ref={editorRef}
                className="font-mono p-3 border border-gray-300 rounded-md bg-gray-50 min-h-[150px] w-full focus:outline-none focus:border-primary overflow-auto"
                contentEditable
                suppressContentEditableWarning
                onKeyDown={handleEditorKeyDown}
                onBlur={(e) => setQuery(e.currentTarget.innerText)}
                dangerouslySetInnerHTML={{ __html: query }}
              />
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-gray-500 hover:text-gray-700"
                  onClick={formatSqlQuery}
                  title="Format Query"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <h3 className="text-gray-700 font-medium w-full mb-1">Common Queries:</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertCommonQuery('all-patients')}
            >
              All Patients
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertCommonQuery('age-range')}
            >
              Patients by Age Range
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertCommonQuery('registration-stats')}
            >
              Registration Stats
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => insertCommonQuery('patients-with-allergies')}
            >
              Patients with Allergies
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button
              className="flex items-center"
              onClick={handleRunQuery}
              disabled={isExecuting}
            >
              <Play className="h-4 w-4 mr-1" />
              <span>Run Query</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-medium">Query Results</h2>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={exportResults}
                disabled={results.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                <span>Export Results</span>
              </Button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-md overflow-auto">
            {results.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                {isExecuting ? 'Executing query...' : 'No results to display. Run a query to see results.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(results[0]).map((column) => (
                      <TableHead key={column}>
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Object.values(row).map((value, valueIndex) => (
                        <TableCell key={valueIndex}>
                          {value === null ? 'NULL' : String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {results.length > 0 && (
              <>
                <div>Query executed in <span className="font-medium">{executionTime}s</span></div>
                <div>{results.length} rows returned</div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Save Query Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Query</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="query-name">
                Query Name
              </label>
              <Input
                id="query-name"
                value={newQueryName}
                onChange={(e) => setNewQueryName(e.target.value)}
                placeholder="Enter a name for this query"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="query-description">
                Description (optional)
              </label>
              <Input
                id="query-description"
                value={newQueryDescription}
                onChange={(e) => setNewQueryDescription(e.target.value)}
                placeholder="Enter a description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuery}>
              Save Query
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Load Query Dialog */}
      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Load Saved Query</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {savedQueries.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No saved queries found
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {savedQueries.map((savedQuery) => (
                  <div
                    key={savedQuery.id}
                    className="border border-gray-200 rounded-md p-3 mb-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleLoadQuery(savedQuery)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{savedQuery.name}</h3>
                        {savedQuery.description && (
                          <p className="text-sm text-gray-500 mt-1">{savedQuery.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-destructive"
                        onClick={(e) => handleDeleteSavedQuery(savedQuery.id, e)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-hidden whitespace-nowrap overflow-ellipsis">
                      {savedQuery.query.length > 50 
                        ? savedQuery.query.substring(0, 50) + '...' 
                        : savedQuery.query}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsLoadDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
