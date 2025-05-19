
import React from 'react';
import { Building, Home, Briefcase, GraduationCap, Users, LandPlot } from 'lucide-react';

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  website?: string;
  phone?: string;
  category?: string;
  description?: string;
}

export interface SearchCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  results: SearchResult[];
}

export const searchCategories: SearchCategory[] = [
  {
    id: "retirement",
    name: "Retirement Communities",
    icon: <Home className="h-5 w-5" />,
    results: [
      {
        id: "r1",
        name: "Sunset Haven Retirement Community",
        address: "123 Peaceful Lane, Tranquil City, CA 90210",
        website: "https://sunsethaven.example.com",
        phone: "(555) 123-4567",
        category: "Retirement Community",
        description: "A peaceful community for active seniors with amenities including gardens, pools, and social activities."
      },
      {
        id: "r2",
        name: "Golden Years Village",
        address: "456 Serenity Drive, Quiet Town, CA 90211",
        website: "https://goldenyears.example.com",
        phone: "(555) 987-6543",
        category: "Retirement Community",
        description: "Luxury retirement living with full-service amenities and healthcare options."
      },
      {
        id: "r3",
        name: "Tranquil Pines Senior Living",
        address: "789 Evergreen Terrace, Green Valley, CA 90212",
        website: "https://tranquilpines.example.com",
        phone: "(555) 456-7890",
        category: "Retirement Community",
        description: "Nature-focused retirement community with hiking trails and outdoor activities."
      },
      {
        id: "r4",
        name: "Harbor View Retirement",
        address: "321 Coastal Highway, Seaside, CA 90213",
        website: "https://harborview.example.com",
        phone: "(555) 789-0123",
        category: "Retirement Community",
        description: "Oceanfront retirement living with breathtaking views and premium services."
      }
    ]
  },
  {
    id: "assisted",
    name: "Assisted Living Facilities",
    icon: <Users className="h-5 w-5" />,
    results: [
      {
        id: "a1",
        name: "Helping Hands Care Center",
        address: "100 Supportive Street, Care City, CA 90220",
        website: "https://helpinghands.example.com",
        phone: "(555) 234-5678",
        category: "Assisted Living",
        description: "Professional staff providing 24/7 support for seniors needing daily assistance."
      },
      {
        id: "a2",
        name: "Gentle Care Living",
        address: "200 Compassion Avenue, Kindness, CA 90221",
        website: "https://gentlecare.example.com",
        phone: "(555) 345-6789",
        category: "Assisted Living",
        description: "Specialized care programs for seniors with varying levels of assistance needs."
      },
      {
        id: "a3",
        name: "Sunrise Assisted Living",
        address: "300 Dawn Drive, Morning City, CA 90222",
        website: "https://sunriseal.example.com",
        phone: "(555) 456-7891",
        category: "Assisted Living",
        description: "Bright, cheerful environment with customized care plans for each resident."
      }
    ]
  },
  {
    id: "inhome",
    name: "In-Home Care Services",
    icon: <Home className="h-5 w-5" />,
    results: [
      {
        id: "h1",
        name: "Comfort Care At Home",
        address: "150 Home Sweet Home Rd, Hometown, CA 90230",
        website: "https://comfortcare.example.com",
        phone: "(555) 567-8901",
        category: "In-Home Care",
        description: "Professional caregivers providing personalized in-home support services."
      },
      {
        id: "h2",
        name: "Home Instead Senior Care",
        address: "250 Family Lane, Residential, CA 90231",
        website: "https://homeinstead.example.com",
        phone: "(555) 678-9012",
        category: "In-Home Care",
        description: "Trusted in-home care services allowing seniors to maintain independence."
      },
      {
        id: "h3",
        name: "Guardian Angels Home Care",
        address: "350 Watchful Street, Safetown, CA 90232",
        website: "https://guardianangels.example.com",
        phone: "(555) 789-0124",
        category: "In-Home Care",
        description: "Compassionate caregivers providing assistance with daily activities and medical needs."
      },
      {
        id: "h4",
        name: "Visiting Nurses Association",
        address: "450 Medical Parkway, Wellness, CA 90233",
        website: "https://visitingnurses.example.com",
        phone: "(555) 890-1235",
        category: "In-Home Care",
        description: "Skilled nursing and therapy services delivered in the comfort of your home."
      }
    ]
  },
  {
    id: "legal",
    name: "Legal Services",
    icon: <Briefcase className="h-5 w-5" />,
    results: [
      {
        id: "l1",
        name: "Elder Law Partners",
        address: "500 Justice Avenue, Lawtown, CA 90240",
        website: "https://elderlawpartners.example.com",
        phone: "(555) 901-2345",
        category: "Legal Services",
        description: "Specialized legal services for seniors including estate planning and elder law."
      },
      {
        id: "l2",
        name: "Senior Rights Advocates",
        address: "600 Protection Plaza, Rightsville, CA 90241",
        website: "https://seniorrights.example.com",
        phone: "(555) 012-3456",
        category: "Legal Services",
        description: "Advocacy and legal assistance protecting the rights of senior citizens."
      }
    ]
  },
  {
    id: "government",
    name: "Government Resources",
    icon: <Building className="h-5 w-5" />,
    results: [
      {
        id: "g1",
        name: "Department of Aging Services",
        address: "700 Government Center, Capital City, CA 90250",
        website: "https://agingservices.gov.example",
        phone: "(555) 123-4568",
        category: "Government Office",
        description: "Official government department providing resources and support for seniors."
      },
      {
        id: "g2",
        name: "Medicare Assistance Program",
        address: "800 Benefits Boulevard, Medicare City, CA 90251",
        website: "https://medicarehelp.gov.example",
        phone: "(555) 234-5679",
        category: "Government Office",
        description: "Government program assisting seniors with Medicare enrollment and benefits."
      }
    ]
  },
  {
    id: "community",
    name: "Senior Community Centers",
    icon: <LandPlot className="h-5 w-5" />,
    results: [
      {
        id: "c1",
        name: "Golden Age Community Center",
        address: "900 Social Circle, Community Town, CA 90260",
        website: "https://goldenagecenter.example.com",
        phone: "(555) 345-6780",
        category: "Senior Community",
        description: "Vibrant community center offering social activities, meals, and resources for seniors."
      },
      {
        id: "c2",
        name: "Silver Friends Senior Center",
        address: "1000 Friendship Lane, Togetherville, CA 90261",
        website: "https://silverfriends.example.com",
        phone: "(555) 456-7892",
        category: "Senior Community",
        description: "Warm, welcoming environment for seniors to gather, learn, and socialize."
      },
      {
        id: "c3",
        name: "Active Seniors Club",
        address: "1100 Vitality Road, Energetic, CA 90262",
        website: "https://activeseniors.example.com",
        phone: "(555) 567-8902",
        category: "Senior Community",
        description: "Focus on active lifestyle with fitness classes, outings, and educational workshops."
      }
    ]
  }
];
