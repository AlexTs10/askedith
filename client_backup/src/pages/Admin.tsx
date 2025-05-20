import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  User, 
  Mail, 
  Calendar,
  FileText,
  Clock10
} from 'lucide-react';

// Types for our data
type QuestionnaireStatus = 'completed' | 'abandoned' | 'in_progress';

interface Questionnaire {
  id: number;
  status: QuestionnaireStatus;
  lastQuestionAnswered?: number;
  startedAt: Date;
  completedAt?: Date;
  userName?: string;
  userEmail?: string;
  userIp?: string;
  userAgent?: string;
}

interface Analytics {
  total: number;
  completed: number;
  abandoned: number;
  inProgress: number;
  completionRate: number;
}

interface EmailStats {
  totalSent: number;
  sentLast24Hours: number;
  sentLastWeek: number;
  sentLastMonth: number;
  byCategory: {
    category: string;
    count: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // State for our data
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<Questionnaire[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // State for filtering
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Mock data for prototype - will be replaced with API calls in production
  useEffect(() => {
    // Simulate API call delay
    const fetchData = async () => {
      try {
        setLoading(true);
        // In production, these would be API calls
        setTimeout(() => {
          const mockQuestionnaires: Questionnaire[] = [
            {
              id: 1,
              status: 'completed',
              lastQuestionAnswered: 15,
              startedAt: new Date('2025-05-01T10:30:00'),
              completedAt: new Date('2025-05-01T10:45:00'),
              userName: 'John Smith',
              userEmail: 'john@example.com',
              userIp: '192.168.1.101',
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            {
              id: 2,
              status: 'abandoned',
              lastQuestionAnswered: 7,
              startedAt: new Date('2025-05-02T14:20:00'),
              userIp: '192.168.1.102',
              userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)'
            },
            {
              id: 3,
              status: 'in_progress',
              lastQuestionAnswered: 4,
              startedAt: new Date('2025-05-10T09:15:00'),
              userName: 'Mary Johnson',
              userEmail: 'mary@example.com',
              userIp: '192.168.1.103',
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
            },
            {
              id: 4,
              status: 'completed',
              lastQuestionAnswered: 15,
              startedAt: new Date('2025-05-09T16:30:00'),
              completedAt: new Date('2025-05-09T16:50:00'),
              userName: 'Robert Williams',
              userEmail: 'robert@example.com',
              userIp: '192.168.1.104',
              userAgent: 'Mozilla/5.0 (X11; Linux x86_64)'
            },
            {
              id: 5,
              status: 'abandoned',
              lastQuestionAnswered: 3,
              startedAt: new Date('2025-05-08T08:45:00'),
              userIp: '192.168.1.105',
              userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)'
            }
          ];
          
          const mockAnalytics: Analytics = {
            total: 5,
            completed: 2,
            abandoned: 2,
            inProgress: 1,
            completionRate: 40
          };
          
          const mockEmailStats: EmailStats = {
            totalSent: 12,
            sentLast24Hours: 3,
            sentLastWeek: 8,
            sentLastMonth: 12,
            byCategory: [
              { category: 'Veteran Benefits', count: 4 },
              { category: 'Aging Life Care Professionals', count: 3 },
              { category: 'Home Care Companies', count: 2 },
              { category: 'Government Agencies', count: 2 },
              { category: 'Financial Advisors', count: 1 }
            ]
          };
          
          setQuestionnaires(mockQuestionnaires);
          setFilteredQuestionnaires(mockQuestionnaires);
          setAnalytics(mockAnalytics);
          setEmailStats(mockEmailStats);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Apply filters
  useEffect(() => {
    if (questionnaires.length === 0) return;
    
    let filtered = [...questionnaires];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.userName?.toLowerCase().includes(query) || 
        q.userEmail?.toLowerCase().includes(query)
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(q => q.startedAt >= today);
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(q => q.startedAt >= weekAgo);
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(q => q.startedAt >= monthAgo);
      }
    }
    
    setFilteredQuestionnaires(filtered);
  }, [questionnaires, statusFilter, searchQuery, dateFilter]);
  
  // Handler for refreshing data
  const handleRefresh = () => {
    setLoading(true);
    // In production this would be an API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Data refreshed",
        description: "Dashboard data has been updated.",
      });
    }, 500);
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Calculate time spent on questionnaire
  const calculateTimeSpent = (startDate: Date, endDate?: Date) => {
    const end = endDate || new Date();
    const diffMs = end.getTime() - startDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minutes`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };
  
  // Generate data for completion rate chart
  const getCompletionRateData = () => {
    if (!analytics) return [];
    
    return [
      { name: 'Completed', value: analytics.completed, fill: '#4CAF50' },
      { name: 'Abandoned', value: analytics.abandoned, fill: '#F44336' },
      { name: 'In Progress', value: analytics.inProgress, fill: '#2196F3' }
    ];
  };
  
  // Generate data for drop-off points chart
  const getDropOffData = () => {
    if (!questionnaires) return [];
    
    // Count how many questionnaires were abandoned at each question
    const abandonedQuestionnaires = questionnaires.filter(q => q.status === 'abandoned');
    const dropOffPoints: {[key: number]: number} = {};
    
    abandonedQuestionnaires.forEach(q => {
      const lastQuestion = q.lastQuestionAnswered || 0;
      dropOffPoints[lastQuestion] = (dropOffPoints[lastQuestion] || 0) + 1;
    });
    
    // Convert to array for chart
    return Object.entries(dropOffPoints).map(([question, count]) => ({
      question: `Q${question}`,
      count
    }));
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
            <CardDescription>Fetching dashboard data...</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (errorMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <XCircle className="text-red-500 w-12 h-12 mb-4" />
              <p className="text-center">{errorMessage}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRefresh} className="w-full">Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-600">Admin Dashboard</h1>
            <p className="text-gray-500">Monitor questionnaire completions and user activity</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw size={16} />
              <span>Refresh</span>
            </Button>
            <Link to="/">
              <Button variant="outline" className="ml-2">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Questionnaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.total || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div className="text-3xl font-bold text-green-600">{analytics?.completed || 0}</div>
              <div className="text-green-600">
                <CheckCircle />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Abandoned</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div className="text-3xl font-bold text-red-500">{analytics?.abandoned || 0}</div>
              <div className="text-red-500">
                <XCircle />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div className="text-3xl font-bold text-blue-500">{analytics?.inProgress || 0}</div>
              <div className="text-blue-500">
                <Clock />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Second row of stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Completion Rate</CardTitle>
              <CardDescription>
                Overall {analytics?.completionRate}% of users complete the questionnaire
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCompletionRateData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getCompletionRateData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Drop-off Points</CardTitle>
              <CardDescription>
                Questions where users most frequently abandon the form
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getDropOffData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Email Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Email Statistics</CardTitle>
            <CardDescription>Track email sending activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-gray-500 mb-1">Total Emails Sent</div>
                <div className="text-2xl font-bold">{emailStats?.totalSent || 0}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-gray-500 mb-1">Last 24 Hours</div>
                <div className="text-2xl font-bold">{emailStats?.sentLast24Hours || 0}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-gray-500 mb-1">Last Week</div>
                <div className="text-2xl font-bold">{emailStats?.sentLastWeek || 0}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-gray-500 mb-1">Last Month</div>
                <div className="text-2xl font-bold">{emailStats?.sentLastMonth || 0}</div>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="count"
                    nameKey="category"
                    data={emailStats?.byCategory || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {emailStats?.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <TabsList>
              <TabsTrigger value="all">All Questionnaires</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="abandoned">Abandoned</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select 
                value={dateFilter} 
                onValueChange={setDateFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestionnaires.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No questionnaires found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQuestionnaires.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell>{q.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{q.userName || 'Anonymous'}</span>
                              {q.userEmail && (
                                <span className="text-sm text-gray-500">{q.userEmail}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {q.status === 'completed' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            )}
                            {q.status === 'abandoned' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Abandoned
                              </span>
                            )}
                            {q.status === 'in_progress' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                In Progress
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {q.lastQuestionAnswered ? 
                              `${q.lastQuestionAnswered}/15 (${Math.round((q.lastQuestionAnswered/15)*100)}%)` : 
                              'N/A'
                            }
                          </TableCell>
                          <TableCell>{formatDate(q.startedAt)}</TableCell>
                          <TableCell>{calculateTimeSpent(q.startedAt, q.completedAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestionnaires
                      .filter(q => q.status === 'completed')
                      .map((q) => (
                        <TableRow key={q.id}>
                          <TableCell>{q.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{q.userName || 'Anonymous'}</span>
                              {q.userEmail && (
                                <span className="text-sm text-gray-500">{q.userEmail}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {q.lastQuestionAnswered ? 
                              `${q.lastQuestionAnswered}/15 (${Math.round((q.lastQuestionAnswered/15)*100)}%)` : 
                              'N/A'
                            }
                          </TableCell>
                          <TableCell>{formatDate(q.startedAt)}</TableCell>
                          <TableCell>{q.completedAt ? formatDate(q.completedAt) : 'N/A'}</TableCell>
                          <TableCell>{calculateTimeSpent(q.startedAt, q.completedAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="abandoned" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Last Question</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Time Active</TableHead>
                      <TableHead>Device Info</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestionnaires
                      .filter(q => q.status === 'abandoned')
                      .map((q) => (
                        <TableRow key={q.id}>
                          <TableCell>{q.id}</TableCell>
                          <TableCell>{q.userIp || 'Unknown'}</TableCell>
                          <TableCell>Question {q.lastQuestionAnswered || 'Unknown'}</TableCell>
                          <TableCell>{formatDate(q.startedAt)}</TableCell>
                          <TableCell>{calculateTimeSpent(q.startedAt)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            <span className="text-xs">{q.userAgent || 'Unknown'}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="in_progress" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Current Progress</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Time Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestionnaires
                      .filter(q => q.status === 'in_progress')
                      .map((q) => (
                        <TableRow key={q.id}>
                          <TableCell>{q.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{q.userName || 'Anonymous'}</span>
                              {q.userEmail && (
                                <span className="text-sm text-gray-500">{q.userEmail}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {q.lastQuestionAnswered ? 
                              `Question ${q.lastQuestionAnswered}/15` : 
                              'N/A'
                            }
                          </TableCell>
                          <TableCell>{formatDate(q.startedAt)}</TableCell>
                          <TableCell>{calculateTimeSpent(q.startedAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Clock10 className="h-4 w-4 mr-1" />
                              Send Reminder
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;