import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Search, ArrowLeft, Database, Grid3x3, ChevronRight } from 'lucide-react';
import { RelatedTools } from '../components/studio/RelatedTools';

interface DimensionItem {
  name: string;
  category: string;
  width?: string;
  depth?: string;
  height?: string;
  diameter?: string;
  notes?: string;
  jargon?: string; // Event design terminology
}

const DIMENSIONS: DimensionItem[] = [
  // ==================== FURNITURE - SEATING ====================
  { name: 'Standard Sofa (3-Seat)', category: 'Furniture - Seating', width: '84" - 96"', depth: '36" - 40"', height: '30" - 36"', notes: 'Common residential, seat height 18"' },
  { name: 'Loveseat (2-Seat)', category: 'Furniture - Seating', width: '58" - 64"', depth: '36" - 40"', height: '30" - 36"', notes: 'Seat height 18"' },
  { name: 'Sectional Corner', category: 'Furniture - Seating', width: '36" - 40"', depth: '36" - 40"', height: '30" - 36"', notes: 'Modular seating unit' },
  { name: 'Sectional Chaise', category: 'Furniture - Seating', width: '36" - 40"', depth: '60" - 75"', height: '30" - 36"', notes: 'Extended lounging section' },
  { name: 'Armchair', category: 'Furniture - Seating', width: '30" - 36"', depth: '32" - 38"', height: '30" - 36"', notes: 'Seat height 18"' },
  { name: 'Club Chair', category: 'Furniture - Seating', width: '32" - 36"', depth: '34" - 38"', height: '28" - 32"', notes: 'Low profile, deep seat' },
  { name: 'Accent Chair', category: 'Furniture - Seating', width: '26" - 30"', depth: '28" - 32"', height: '32" - 36"', notes: 'Decorative seating' },
  { name: 'Wingback Chair', category: 'Furniture - Seating', width: '30" - 34"', depth: '32" - 36"', height: '42" - 48"', notes: 'High back with wings' },
  { name: 'Rocking Chair', category: 'Furniture - Seating', width: '26" - 30"', depth: '36" - 40"', height: '40" - 44"', notes: 'Includes rocker clearance' },
  { name: 'Recliner', category: 'Furniture - Seating', width: '32" - 40"', depth: '36" - 42" (72" reclined)', height: '38" - 42"', notes: 'Requires clearance behind' },
  { name: 'Ottoman (Small)', category: 'Furniture - Seating', width: '18" - 24"', depth: '18" - 24"', height: '16" - 18"' },
  { name: 'Ottoman (Large)', category: 'Furniture - Seating', width: '36" - 48"', depth: '36" - 48"', height: '16" - 18"', notes: 'Can double as coffee table' },
  { name: 'Bench (Upholstered)', category: 'Furniture - Seating', width: '48" - 72"', depth: '18" - 24"', height: '18" - 20"' },
  { name: 'Bench (Dining)', category: 'Furniture - Seating', width: '48" - 72"', depth: '14" - 18"', height: '18"' },
  { name: 'Dining Chair (Standard)', category: 'Furniture - Seating', width: '18" - 20"', depth: '20" - 24"', height: '36" - 40"', notes: 'Seat height 18"' },
  { name: 'Dining Chair (Armchair)', category: 'Furniture - Seating', width: '22" - 26"', depth: '22" - 26"', height: '36" - 40"', notes: "Captain's chair" },
  { name: 'Dining Chair (Parsons)', category: 'Furniture - Seating', width: '18" - 20"', depth: '22" - 24"', height: '38" - 40"', notes: 'Upholstered back' },
  { name: 'Counter Stool', category: 'Furniture - Seating', width: '16" - 18"', depth: '16" - 18"', height: '24" - 26"', notes: 'Seat height for 36" counter' },
  { name: 'Bar Stool (Standard)', category: 'Furniture - Seating', width: '16" - 18"', depth: '16" - 18"', height: '30"', notes: 'Seat height for 42" bar' },
  { name: 'Bar Stool (Backless)', category: 'Furniture - Seating', width: '14" - 16"', depth: '14" - 16"', height: '30"' },
  { name: 'Swivel Stool', category: 'Furniture - Seating', width: '16" - 18"', depth: '16" - 18"', height: '24" - 30"', notes: 'Adjustable height common' },

  // ==================== FURNITURE - TABLES ====================
  { name: 'Coffee Table (Rectangle)', category: 'Furniture - Tables', width: '48" - 60"', depth: '24" - 30"', height: '16" - 18"', notes: '16-18" from sofa' },
  { name: 'Coffee Table (Square)', category: 'Furniture - Tables', width: '36" - 48"', depth: '36" - 48"', height: '16" - 18"' },
  { name: 'Coffee Table (Round)', category: 'Furniture - Tables', diameter: '36" - 48"', height: '16" - 18"' },
  { name: 'Coffee Table (Oval)', category: 'Furniture - Tables', width: '48" - 60"', depth: '30" - 36"', height: '16" - 18"' },
  { name: 'End Table / Side Table', category: 'Furniture - Tables', width: '18" - 24"', depth: '18" - 24"', height: '22" - 26"', notes: 'Match sofa arm height' },
  { name: 'C-Table / Slide Table', category: 'Furniture - Tables', width: '10" - 15"', depth: '18" - 24"', height: '24" - 26"', notes: 'Slides under sofa' },
  { name: 'Nesting Tables (Set of 3)', category: 'Furniture - Tables', width: '18" - 24" (largest)', depth: '12" - 18"', height: '18" - 24"', notes: 'Decreasing sizes' },
  { name: 'Dining Table (2-Person)', category: 'Furniture - Tables', width: '24" - 30"', depth: '24" - 30"', height: '28" - 30"' },
  { name: 'Dining Table (4-Person Square)', category: 'Furniture - Tables', width: '36" - 42"', depth: '36" - 42"', height: '28" - 30"' },
  { name: 'Dining Table (4-Person Rectangle)', category: 'Furniture - Tables', width: '48"', depth: '30" - 36"', height: '28" - 30"' },
  { name: 'Dining Table (6-Person)', category: 'Furniture - Tables', width: '60" - 72"', depth: '36" - 42"', height: '28" - 30"' },
  { name: 'Dining Table (8-Person)', category: 'Furniture - Tables', width: '84" - 96"', depth: '36" - 42"', height: '28" - 30"' },
  { name: 'Dining Table (10-Person)', category: 'Furniture - Tables', width: '96" - 120"', depth: '42" - 48"', height: '28" - 30"' },
  { name: 'Dining Table (Round 4-Person)', category: 'Furniture - Tables', diameter: '36" - 44"', height: '28" - 30"' },
  { name: 'Dining Table (Round 6-Person)', category: 'Furniture - Tables', diameter: '54" - 60"', height: '28" - 30"' },
  { name: 'Console Table', category: 'Furniture - Tables', width: '48" - 72"', depth: '12" - 18"', height: '30" - 36"', notes: 'Against wall' },
  { name: 'Sofa Table', category: 'Furniture - Tables', width: '48" - 72"', depth: '14" - 18"', height: '26" - 30"', notes: 'Behind sofa' },
  { name: 'Entry Table / Hall Table', category: 'Furniture - Tables', width: '36" - 48"', depth: '12" - 16"', height: '30" - 36"' },
  { name: 'Desk (Small)', category: 'Furniture - Tables', width: '36" - 48"', depth: '20" - 24"', height: '28" - 30"' },
  { name: 'Desk (Standard)', category: 'Furniture - Tables', width: '48" - 60"', depth: '24" - 30"', height: '28" - 30"' },
  { name: 'Desk (Executive)', category: 'Furniture - Tables', width: '60" - 72"', depth: '30" - 36"', height: '28" - 30"' },
  { name: 'Desk (L-Shaped)', category: 'Furniture - Tables', width: '60" - 72"', depth: '60" - 72"', height: '28" - 30"', notes: 'Corner configuration' },
  { name: 'Writing Desk / Secretary', category: 'Furniture - Tables', width: '30" - 42"', depth: '18" - 24"', height: '30" - 36"' },
  { name: 'Credenza', category: 'Furniture - Tables', width: '60" - 72"', depth: '18" - 24"', height: '28" - 32"', notes: 'Storage below' },
  { name: 'Pedestal Table', category: 'Furniture - Tables', diameter: '30" - 48"', height: '28" - 30"', notes: 'Single center support' },
  { name: 'Drop Leaf Table', category: 'Furniture - Tables', width: '28" - 36" (closed), 48" - 60" (open)', depth: '28" - 36"', height: '28" - 30"' },
  { name: 'Kitchen Island', category: 'Furniture - Tables', width: '36" - 48"', depth: '24" - 36"', height: '36"', notes: 'Counter height' },
  { name: 'Bar Table / Pub Table', category: 'Furniture - Tables', width: '24" - 36"', depth: '24" - 36"', height: '40" - 42"' },

  // ==================== FURNITURE - STORAGE ====================
  { name: 'Bookshelf (Low)', category: 'Furniture - Storage', width: '36" - 48"', depth: '10" - 14"', height: '30" - 36"' },
  { name: 'Bookshelf (Standard)', category: 'Furniture - Storage', width: '36" - 48"', depth: '10" - 14"', height: '72" - 84"' },
  { name: 'Bookshelf (Wide)', category: 'Furniture - Storage', width: '60" - 84"', depth: '12" - 16"', height: '72" - 84"' },
  { name: 'Ladder Shelf', category: 'Furniture - Storage', width: '24" - 30" (top), 36" - 42" (base)', depth: '18" - 24"', height: '72" - 84"', notes: 'Tapered design' },
  { name: 'Corner Bookshelf', category: 'Furniture - Storage', width: '24" - 36"', depth: '24" - 36"', height: '60" - 84"', notes: 'Triangular footprint' },
  { name: 'Etagere', category: 'Furniture - Storage', width: '24" - 36"', depth: '12" - 18"', height: '60" - 84"', notes: 'Open shelving unit' },
  { name: 'Dresser (Low/Wide)', category: 'Furniture - Storage', width: '48" - 72"', depth: '18" - 24"', height: '30" - 36"', notes: '6-9 drawers' },
  { name: 'Dresser (Standard)', category: 'Furniture - Storage', width: '36" - 48"', depth: '18" - 22"', height: '42" - 48"', notes: '5-7 drawers' },
  { name: 'Tall Boy / Chest (Vertical)', category: 'Furniture - Storage', width: '30" - 36"', depth: '18" - 20"', height: '48" - 60"', notes: '5+ drawers, narrow and tall' },
  { name: 'Chest of Drawers', category: 'Furniture - Storage', width: '30" - 40"', depth: '16" - 20"', height: '36" - 48"', notes: '4-6 drawers' },
  { name: 'Nightstand / Bedside Table', category: 'Furniture - Storage', width: '18" - 24"', depth: '16" - 20"', height: '24" - 28"', notes: 'Match mattress height' },
  { name: 'Lingerie Chest', category: 'Furniture - Storage', width: '18" - 24"', depth: '14" - 18"', height: '48" - 54"', notes: 'Narrow tall chest' },
  { name: 'Wardrobe (Single)', category: 'Furniture - Storage', width: '30" - 36"', depth: '20" - 24"', height: '72" - 84"' },
  { name: 'Wardrobe (Double)', category: 'Furniture - Storage', width: '48" - 60"', depth: '20" - 24"', height: '72" - 84"', notes: 'Two door' },
  { name: 'Armoire', category: 'Furniture - Storage', width: '36" - 48"', depth: '20" - 24"', height: '72" - 84"', notes: 'Often has shelves/drawers' },
  { name: 'China Cabinet / Hutch', category: 'Furniture - Storage', width: '48" - 72"', depth: '18" - 24"', height: '72" - 84"', notes: 'Upper glass doors typical' },
  { name: 'Buffet / Sideboard', category: 'Furniture - Storage', width: '48" - 72"', depth: '18" - 24"', height: '30" - 36"', notes: 'Dining room storage' },
  { name: 'Media Console / TV Stand', category: 'Furniture - Storage', width: '48" - 72"', depth: '16" - 20"', height: '20" - 26"' },
  { name: 'Media Console (Large)', category: 'Furniture - Storage', width: '72" - 96"', depth: '18" - 24"', height: '24" - 30"', notes: 'For 65"+ TVs' },
  { name: 'Storage Bench', category: 'Furniture - Storage', width: '36" - 48"', depth: '16" - 20"', height: '18" - 20"', notes: 'Lift-top storage' },
  { name: 'Hope Chest / Trunk', category: 'Furniture - Storage', width: '36" - 48"', depth: '18" - 24"', height: '18" - 24"', notes: 'Traditional storage chest' },
  { name: 'File Cabinet (2-Drawer)', category: 'Furniture - Storage', width: '15" - 18"', depth: '24" - 28"', height: '28" - 30"' },
  { name: 'File Cabinet (4-Drawer)', category: 'Furniture - Storage', width: '15" - 18"', depth: '24" - 28"', height: '52" - 56"' },
  { name: 'Pantry Cabinet', category: 'Furniture - Storage', width: '24" - 36"', depth: '18" - 24"', height: '72" - 84"' },

  // ==================== FURNITURE - BEDS ====================
  { name: 'Crib', category: 'Furniture - Beds', width: '28"', depth: '52"', height: '35" - 40"', notes: 'Mattress 27.5" x 51.5"' },
  { name: 'Toddler Bed', category: 'Furniture - Beds', width: '28"', depth: '52"', height: '20" - 24"', notes: 'Uses crib mattress' },
  { name: 'Twin Bed', category: 'Furniture - Beds', width: '39"', depth: '75"', height: '25" (mattress)', notes: 'Mattress 38" x 75"' },
  { name: 'Twin XL Bed', category: 'Furniture - Beds', width: '39"', depth: '80"', height: '25" (mattress)', notes: 'College dorm standard' },
  { name: 'Full / Double Bed', category: 'Furniture - Beds', width: '54"', depth: '75"', height: '25" (mattress)', notes: 'Mattress 53" x 75"' },
  { name: 'Queen Bed', category: 'Furniture - Beds', width: '60"', depth: '80"', height: '25" (mattress)', notes: 'Mattress 60" x 80"' },
  { name: 'King Bed', category: 'Furniture - Beds', width: '76"', depth: '80"', height: '25" (mattress)', notes: 'Mattress 76" x 80"' },
  { name: 'California King', category: 'Furniture - Beds', width: '72"', depth: '84"', height: '25" (mattress)', notes: 'Mattress 72" x 84"' },
  { name: 'Daybed', category: 'Furniture - Beds', width: '39"', depth: '75"', height: '36" - 42"', notes: 'Twin size with back/sides' },
  { name: 'Trundle Bed', category: 'Furniture - Beds', width: '38"', depth: '74"', height: '6" - 10" (stored)', notes: 'Fits under twin bed' },
  { name: 'Bunk Bed (Standard)', category: 'Furniture - Beds', width: '39"', depth: '75"', height: '65" - 72"', notes: 'Twin over twin' },
  { name: 'Bunk Bed (Full over Full)', category: 'Furniture - Beds', width: '54"', depth: '75"', height: '72" - 78"' },
  { name: 'Loft Bed', category: 'Furniture - Beds', width: '39" - 54"', depth: '75" - 80"', height: '60" - 72"', notes: 'Raised bed, space underneath' },

  // ==================== THEATRE - FLATS ====================
  { name: 'Standard Flat (4\' x 8\')', category: 'Theatre - Flats', width: '4\'-0"', depth: '5.5" (typical frame)', height: '8\'-0"', notes: 'Most common size, matches plywood' },
  { name: 'Standard Flat (4\' x 10\')', category: 'Theatre - Flats', width: '4\'-0"', depth: '5.5"', height: '10\'-0"', notes: 'Taller ceilings' },
  { name: 'Standard Flat (4\' x 12\')', category: 'Theatre - Flats', width: '4\'-0"', depth: '5.5"', height: '12\'-0"', notes: 'High walls' },
  { name: 'Wide Flat (5\' x 10\')', category: 'Theatre - Flats', width: '5\'-0"', depth: '5.5"', height: '10\'-0"' },
  { name: 'Hollywood Flat', category: 'Theatre - Flats', width: '4\'-0"', depth: '1" - 2"', height: '8\'-0" - 12\'-0"', notes: 'Hard covered, no toggle rails' },
  { name: 'Broadway Flat', category: 'Theatre - Flats', width: '5\'-9"', depth: '5.5"', height: '12\'-0" - 16\'-0"', notes: 'NYC standard, wider and taller' },
  { name: 'Door Flat (3\' Door)', category: 'Theatre - Flats', width: '4\'-0" - 6\'-0"', depth: '5.5"', height: '8\'-0" - 12\'-0"', notes: '3\'-0" opening typical' },
  { name: 'Window Flat', category: 'Theatre - Flats', width: '4\'-0" - 6\'-0"', depth: '5.5"', height: '8\'-0" - 12\'-0"', notes: 'Opening varies by design' },
  { name: 'Jog / Return', category: 'Theatre - Flats', width: '1\'-0" - 2\'-0"', depth: '5.5"', height: '8\'-0" - 12\'-0"', notes: 'Narrow flat for corners' },
  { name: 'Two-fold (Book Flat)', category: 'Theatre - Flats', width: '8\'-0" (total, 2x 4\' flats)', depth: '5.5"', height: '8\'-0" - 12\'-0"', notes: 'Hinged, self-standing' },
  { name: 'Three-fold', category: 'Theatre - Flats', width: '12\'-0" (total, 3x 4\' flats)', depth: '5.5"', height: '8\'-0" - 12\'-0"', notes: 'Hinged, self-standing' },

  // ==================== THEATRE - PLATFORMS ====================
  { name: 'Stock Platform (4\' x 8\')', category: 'Theatre - Platforms', width: '4\'-0"', depth: '8\'-0"', height: 'Varies (6" - 48")', notes: 'Standard sheet goods size' },
  { name: 'Stock Platform (4\' x 4\')', category: 'Theatre - Platforms', width: '4\'-0"', depth: '4\'-0"', height: 'Varies', notes: 'Half sheet' },
  { name: 'Stock Platform (2\' x 8\')', category: 'Theatre - Platforms', width: '2\'-0"', depth: '8\'-0"', height: 'Varies', notes: 'Narrow platform' },
  { name: 'Stock Platform (2\' x 4\')', category: 'Theatre - Platforms', width: '2\'-0"', depth: '4\'-0"', height: 'Varies', notes: 'Small unit' },
  { name: 'Riser (6")', category: 'Theatre - Platforms', width: '4\'-0"', depth: '8\'-0"', height: '6"', notes: 'Single step height' },
  { name: 'Riser (12")', category: 'Theatre - Platforms', width: '4\'-0"', depth: '8\'-0"', height: '12"', notes: 'Double step' },
  { name: 'Riser (18")', category: 'Theatre - Platforms', width: '4\'-0"', depth: '8\'-0"', height: '18"', notes: 'Three step' },
  { name: 'Riser (24")', category: 'Theatre - Platforms', width: '4\'-0"', depth: '8\'-0"', height: '24"', notes: 'Four step' },
  { name: 'Parallels (Folding Platform)', category: 'Theatre - Platforms', width: '4\'-0"', depth: '8\'-0"', height: '12" - 48"', notes: 'Collapsible, touring' },
  { name: 'Deck (Custom)', category: 'Theatre - Platforms', width: 'Custom', depth: 'Custom', height: 'Varies', notes: 'Built to fit space' },

  // ==================== THEATRE - DOORS ====================
  { name: 'Standard Interior Door', category: 'Theatre - Doors', width: '3\'-0"', depth: '1-3/8" - 1-3/4"', height: '6\'-8"', notes: 'Single door, most common' },
  { name: 'Interior Door (Narrow)', category: 'Theatre - Doors', width: '2\'-6"', depth: '1-3/8"', height: '6\'-8"', notes: 'Closet, bathroom' },
  { name: 'Interior Door (Wide)', category: 'Theatre - Doors', width: '3\'-6"', depth: '1-3/4"', height: '6\'-8"', notes: 'Double door alternative' },
  { name: 'Exterior Door (Residential)', category: 'Theatre - Doors', width: '3\'-0"', depth: '1-3/4" - 2-1/4"', height: '6\'-8" - 7\'-0"', notes: 'Thicker than interior' },
  { name: 'French Door (Single)', category: 'Theatre - Doors', width: '2\'-6" - 3\'-0"', depth: '1-3/4"', height: '6\'-8" - 8\'-0"', notes: 'Glass panes' },
  { name: 'French Door (Pair)', category: 'Theatre - Doors', width: '5\'-0" - 6\'-0" (total)', depth: '1-3/4"', height: '6\'-8" - 8\'-0"', notes: 'Double doors' },
  { name: 'Dutch Door', category: 'Theatre - Doors', width: '3\'-0"', depth: '1-3/4"', height: '6\'-8"', notes: 'Split horizontally' },
  { name: 'Pocket Door', category: 'Theatre - Doors', width: '2\'-6" - 3\'-0"', depth: '1-3/8"', height: '6\'-8"', notes: 'Slides into wall' },
  { name: 'Barn Door', category: 'Theatre - Doors', width: '3\'-0" - 4\'-0"', depth: '1-3/8" - 1-3/4"', height: '6\'-8" - 8\'-0"', notes: 'Sliding, rustic' },
  { name: 'Bifold Door (Single)', category: 'Theatre - Doors', width: '2\'-0" - 3\'-0"', depth: '1-3/8"', height: '6\'-8"', notes: 'Hinged panels, closet' },
  { name: 'Bifold Door (Pair)', category: 'Theatre - Doors', width: '4\'-0" - 6\'-0" (total)', depth: '1-3/8"', height: '6\'-8"', notes: 'Two folding units' },
  { name: 'Swinging Cafe Doors', category: 'Theatre - Doors', width: '2\'-6" - 3\'-0" (per door)', depth: '1-1/4"', height: '3\'-0" - 4\'-0"', notes: 'Saloon style, half height' },
  { name: 'Grand Entrance (Double)', category: 'Theatre - Doors', width: '6\'-0" - 8\'-0" (total)', depth: '2"', height: '8\'-0" - 10\'-0"', notes: 'Oversized, theatrical' },

  // ==================== THEATRE - STAIRS ====================
  { name: 'Standard Theatre Stairs (Per Step)', category: 'Theatre - Stairs', width: '3\'-0" - 6\'-0"', depth: '12" (tread)', height: '6" - 8" (riser)', notes: 'OSHA: max 7.75" rise' },
  { name: 'Residential Stairs (Per Step)', category: 'Theatre - Stairs', width: '3\'-0" - 3\'-6"', depth: '10" - 11" (tread)', height: '7" - 7.75" (riser)', notes: 'Building code compliant' },
  { name: 'Grand Staircase (Per Step)', category: 'Theatre - Stairs', width: '4\'-0" - 8\'-0"', depth: '12" - 14" (tread)', height: '6" - 7" (riser)', notes: 'Theatrical, wide and shallow' },
  { name: 'Escape Stairs (Per Step)', category: 'Theatre - Stairs', width: '3\'-6" - 4\'-0"', depth: '11" (tread)', height: '7" - 8" (riser)', notes: 'Steep utilitarian stairs' },
  { name: 'Winder Step (Turning Stairs)', category: 'Theatre - Stairs', width: 'Varies (radiates)', depth: '10" - 12" (at narrow end)', height: '7" - 8" (riser)', notes: 'Pie-shaped treads' },
  { name: 'Platform Landing', category: 'Theatre - Stairs', width: '3\'-0" - 6\'-0"', depth: '3\'-0" min', height: 'N/A', notes: 'Between flights, min depth = stair width' },

  // ==================== EVENT - TABLES ====================
  { name: 'Round Table (24")', category: 'Event - Tables', diameter: '24"', height: '30"', notes: 'Cocktail, 1-2 people' },
  { name: 'Round Table (30")', category: 'Event - Tables', diameter: '30"', height: '30"', notes: 'Cocktail, 2-3 people' },
  { name: 'Round Table (36")', category: 'Event - Tables', diameter: '36"', height: '30"', notes: 'Cocktail or dining, seats 4' },
  { name: 'Round Table (48")', category: 'Event - Tables', diameter: '48"', height: '30"', notes: 'Seats 4-6', jargon: '4-top to 6-top' },
  { name: 'Round Table (60")', category: 'Event - Tables', diameter: '60"', height: '30"', notes: 'Seats 8', jargon: '8-top, standard banquet' },
  { name: 'Round Table (66")', category: 'Event - Tables', diameter: '66"', height: '30"', notes: 'Seats 8-10', jargon: '10-top' },
  { name: 'Round Table (72")', category: 'Event - Tables', diameter: '72"', height: '30"', notes: 'Seats 10-12', jargon: '12-top' },
  { name: 'Rectangular Table (6\')', category: 'Event - Tables', width: '30"', depth: '72"', height: '30"', notes: 'Seats 6-8', jargon: '6-foot banquet' },
  { name: 'Rectangular Table (8\')', category: 'Event - Tables', width: '30"', depth: '96"', height: '30"', notes: 'Seats 8-10', jargon: '8-foot banquet' },
  { name: 'Serpentine Table (Quarter Round)', category: 'Event - Tables', width: '30"', depth: '30" (arc)', height: '30"', notes: 'Curved section for buffet' },
  { name: 'Cocktail High-Top (24")', category: 'Event - Tables', diameter: '24"', height: '42"', notes: 'Bar height, standing' },
  { name: 'Cocktail High-Top (30")', category: 'Event - Tables', diameter: '30"', height: '42"', notes: 'Bar height, 2-4 standing' },
  { name: 'Cocktail High-Top (36")', category: 'Event - Tables', diameter: '36"', height: '42"', notes: 'Bar height, 3-5 standing' },
  { name: 'Farm Table (6\')', category: 'Event - Tables', width: '36" - 42"', depth: '72"', height: '30"', notes: 'Rustic style, seats 6' },
  { name: 'Farm Table (8\')', category: 'Event - Tables', width: '36" - 42"', depth: '96"', height: '30"', notes: 'Rustic style, seats 8' },
  { name: 'King\'s Table (Long)', category: 'Event - Tables', width: '30" - 42"', depth: '12\' - 30\' (or more)', height: '30"', notes: 'Continuous seating, head table' },
  { name: 'Classroom Table (6\')', category: 'Event - Tables', width: '18"', depth: '72"', height: '30"', notes: 'Narrow, conference style' },
  { name: 'Classroom Table (8\')', category: 'Event - Tables', width: '18"', depth: '96"', height: '30"', notes: 'Narrow, conference style' },
  { name: 'Half-Round Table', category: 'Event - Tables', width: '30" (depth)', depth: '60" (diameter)', height: '30"', notes: 'Against wall, buffet' },

  // ==================== EVENT - STAGING ====================
  { name: 'Stage Deck (4\' x 8\')', category: 'Event - Staging', width: '4\'-0"', depth: '8\'-0"', height: '8" - 48"', notes: 'Modular, standard size' },
  { name: 'Stage Deck (4\' x 4\')', category: 'Event - Staging', width: '4\'-0"', depth: '4\'-0"', height: '8" - 48"', notes: 'Half deck' },
  { name: 'Stage Riser (8")', category: 'Event - Staging', width: '4\'-0"', depth: '8\'-0"', height: '8"', notes: 'Single riser height' },
  { name: 'Stage Riser (16")', category: 'Event - Staging', width: '4\'-0"', depth: '8\'-0"', height: '16"', notes: 'Double riser' },
  { name: 'Stage Riser (24")', category: 'Event - Staging', width: '4\'-0"', depth: '8\'-0"', height: '24"', notes: 'Triple riser' },
  { name: 'Stage Riser (32")', category: 'Event - Staging', width: '4\'-0"', depth: '8\'-0"', height: '32"', notes: 'Quad riser' },
  { name: 'Runway Section', category: 'Event - Staging', width: '3\'-0" - 4\'-0"', depth: '8\'-0"', height: '8" - 24"', notes: 'Fashion show, awards' },
  { name: 'Choral Risers (3-Tier)', category: 'Event - Staging', width: '6\'-0" - 8\'-0"', depth: '6\'-0" - 8\'-0"', height: '24" (total)', notes: 'Stepped seating for chorus' },
  { name: 'Choral Risers (4-Tier)', category: 'Event - Staging', width: '8\'-0" - 10\'-0"', depth: '8\'-0" - 10\'-0"', height: '32" (total)', notes: 'Stepped seating for chorus' },
  { name: 'Pipe and Drape Section', category: 'Event - Staging', width: 'N/A', depth: 'Varies', height: '8\'-0" - 12\'-0"', notes: 'Adjustable width, backdrop' },
  { name: 'Truss Section (10\')', category: 'Event - Staging', width: 'Varies (12" - 20.5" square/triangle)', depth: '10\'-0"', height: 'N/A', notes: 'Lighting, rigging' },
  { name: 'DJ Booth Riser', category: 'Event - Staging', width: '4\'-0" - 6\'-0"', depth: '4\'-0" - 6\'-0"', height: '16" - 24"', notes: 'Elevated platform for DJ' },
  { name: 'Dance Floor Section (3\' x 3\')', category: 'Event - Staging', width: '3\'-0"', depth: '3\'-0"', height: 'N/A', notes: 'Modular, interlocking' },
  { name: 'Dance Floor Section (4\' x 4\')', category: 'Event - Staging', width: '4\'-0"', depth: '4\'-0"', height: 'N/A', notes: 'Larger modular' },

  // ==================== EVENT - SEATING ====================
  { name: 'Chiavari Chair', category: 'Event - Seating', width: '16" - 17"', depth: '16" - 17"', height: '36"', notes: 'Wedding standard, seat height 17.5"', jargon: 'Tiffany chair, ballroom chair' },
  { name: 'Folding Chair (Metal)', category: 'Event - Seating', width: '18"', depth: '18"', height: '32"', notes: 'Budget option, seat height 17.5"' },
  { name: 'Folding Chair (Padded)', category: 'Event - Seating', width: '18"', depth: '20"', height: '32"', notes: 'Cushioned seat and back' },
  { name: 'Ghost Chair (Acrylic)', category: 'Event - Seating', width: '16" - 17"', depth: '20"', height: '36"', notes: 'Modern, transparent', jargon: 'Louis Ghost, clear chair' },
  { name: 'Cross-Back Chair', category: 'Event - Seating', width: '17" - 18"', depth: '19" - 20"', height: '35" - 37"', notes: 'Rustic, X-back', jargon: 'Vineyard chair, farm chair' },
  { name: 'Banquet Chair', category: 'Event - Seating', width: '20" - 22"', depth: '22" - 24"', height: '36" - 38"', notes: 'Hotel ballroom, padded' },
  { name: 'Stack Chair', category: 'Event - Seating', width: '18" - 20"', depth: '20" - 22"', height: '32" - 34"', notes: 'Stackable, commercial' },
  { name: 'Bar Stool (Event)', category: 'Event - Seating', width: '16" - 18"', depth: '16" - 18"', height: '30"', notes: 'For 42" high-top tables' },
  { name: 'Lounge Sofa (2-Seat)', category: 'Event - Seating', width: '60" - 72"', depth: '30" - 36"', height: '30" - 32"', notes: 'Cocktail area' },
  { name: 'Lounge Sofa (3-Seat)', category: 'Event - Seating', width: '78" - 84"', depth: '30" - 36"', height: '30" - 32"', notes: 'Cocktail area' },
  { name: 'Lounge Chair (Club)', category: 'Event - Seating', width: '30" - 36"', depth: '32" - 36"', height: '28" - 32"', notes: 'Cocktail area' },
  { name: 'Lounge Ottoman', category: 'Event - Seating', width: '24" - 36"', depth: '24" - 36"', height: '16" - 18"', notes: 'Cocktail area, footrest or seat' },
  { name: 'Bench (Event)', category: 'Event - Seating', width: '48" - 72"', depth: '16" - 18"', height: '18"', notes: 'Farm table seating' },

  // ==================== EVENT - LINENS ====================
  { name: 'Tablecloth (60" Round)', category: 'Event - Linens', diameter: '108" - 120"', height: 'N/A', notes: 'For 60" round table, floor length 120"' },
  { name: 'Tablecloth (72" Round)', category: 'Event - Linens', diameter: '120" - 132"', height: 'N/A', notes: 'For 72" round table, floor length 132"' },
  { name: 'Tablecloth (6\' Rectangular)', category: 'Event - Linens', width: '90"', depth: '132"', height: 'N/A', notes: 'For 6\' banquet table, floor length' },
  { name: 'Tablecloth (8\' Rectangular)', category: 'Event - Linens', width: '90"', depth: '156"', height: 'N/A', notes: 'For 8\' banquet table, floor length' },
  { name: 'Fitted Tablecloth (6\')', category: 'Event - Linens', width: 'Fitted', depth: '72"', height: 'N/A', notes: 'Spandex or fitted style' },
  { name: 'Fitted Tablecloth (8\')', category: 'Event - Linens', width: 'Fitted', depth: '96"', height: 'N/A', notes: 'Spandex or fitted style' },
  { name: 'Table Runner', category: 'Event - Linens', width: '12" - 14"', depth: '90" - 120"', height: 'N/A', notes: 'Decorative accent' },
  { name: 'Napkin (Cocktail)', category: 'Event - Linens', width: '5" x 5"', depth: 'N/A', height: 'N/A', notes: 'Beverage napkins' },
  { name: 'Napkin (Dinner)', category: 'Event - Linens', width: '20" x 20"', depth: 'N/A', height: 'N/A', notes: 'Standard linen napkin' },
  { name: 'Chair Sash', category: 'Event - Linens', width: '6" - 8"', depth: '90" - 108"', height: 'N/A', notes: 'Decorative tie' },
  { name: 'Overlay (60" Round)', category: 'Event - Linens', diameter: '72" - 84"', height: 'N/A', notes: 'Top layer, accent' },

  // ==================== ARCHITECTURE - CIRCULATION ====================
  { name: 'Corridor (Residential)', category: 'Architecture - Circulation', width: '3\'-0" - 4\'-0"', depth: 'N/A', height: 'N/A', notes: 'Minimum 3\'-0", comfortable 4\'-0"' },
  { name: 'Corridor (Public Building)', category: 'Architecture - Circulation', width: '5\'-0" - 6\'-0"', depth: 'N/A', height: 'N/A', notes: 'Accessible, code compliant' },
  { name: 'Hallway (Hotel/Apartment)', category: 'Architecture - Circulation', width: '4\'-0" - 5\'-0"', depth: 'N/A', height: 'N/A', notes: 'Typical width' },
  { name: 'ADA Clearance (Door)', category: 'Architecture - Circulation', width: '5\'-0" x 5\'-0"', depth: 'Varies', height: 'N/A', notes: 'Wheelchair turning radius' },
  { name: 'ADA Clearance (Hallway Passing)', category: 'Architecture - Circulation', width: '5\'-0"', depth: 'N/A', height: 'N/A', notes: 'Two wheelchairs passing' },
  { name: 'Ramp (ADA Compliant)', category: 'Architecture - Circulation', width: '3\'-0" min', depth: '1:12 slope', height: 'Varies', notes: '1 foot rise per 12 feet run' },
  { name: 'Landing (Ramp)', category: 'Architecture - Circulation', width: '5\'-0" x 5\'-0" min', depth: 'N/A', height: 'N/A', notes: 'At top, bottom, and direction changes' },

  // ==================== ARCHITECTURE - HEIGHTS ====================
  { name: 'Residential Ceiling (Standard)', category: 'Architecture - Heights', width: 'N/A', depth: 'N/A', height: '8\'-0"', notes: 'Most common residential' },
  { name: 'Residential Ceiling (Luxury)', category: 'Architecture - Heights', width: 'N/A', depth: 'N/A', height: '9\'-0" - 12\'-0"', notes: 'High-end homes' },
  { name: 'Commercial Ceiling', category: 'Architecture - Heights', width: 'N/A', depth: 'N/A', height: '10\'-0" - 12\'-0"', notes: 'Office, retail' },
  { name: 'Retail Ceiling (Big Box)', category: 'Architecture - Heights', width: 'N/A', depth: 'N/A', height: '14\'-0" - 20\'-0"', notes: 'Exposed structure' },
  { name: 'Restaurant Ceiling', category: 'Architecture - Heights', width: 'N/A', depth: 'N/A', height: '10\'-0" - 14\'-0"', notes: 'Varies by concept' },
  { name: 'Theatre Proscenium Height', category: 'Architecture - Heights', width: 'N/A', depth: 'N/A', height: '12\'-0" - 18\'-0"', notes: 'Opening height' },
  { name: 'Theatre Grid Height', category: 'Architecture - Heights', width: 'N/A', depth: 'N/A', height: '40\'-0" - 60\'-0"', notes: 'Rigging grid above stage' },
  { name: 'Fly Loft (Theatre)', category: 'Architecture - Heights', width: 'N/A', depth: 'N/A', height: '2.5x - 3x proscenium height', notes: 'Above stage for flying scenery' },

  // ==================== ARCHITECTURE - COUNTERS ====================
  { name: 'Kitchen Counter (Standard)', category: 'Architecture - Counters', width: 'Varies', depth: '24" - 25"', height: '36"', notes: 'Residential kitchen standard' },
  { name: 'Kitchen Island', category: 'Architecture - Counters', width: '36" - 48"', depth: '24" - 36"', height: '36"', notes: 'Workspace height' },
  { name: 'Kitchen Island (With Seating)', category: 'Architecture - Counters', width: '36" - 48"', depth: '36" - 42"', height: '36"', notes: 'Overhang 12" - 15" for stools' },
  { name: 'Bar Counter', category: 'Architecture - Counters', width: 'Varies', depth: '16" - 24"', height: '42" - 43"', notes: 'Standing/bar stool height' },
  { name: 'Bathroom Vanity (Standard)', category: 'Architecture - Counters', width: '24" - 72"', depth: '18" - 21"', height: '30" - 32"', notes: 'Traditional height' },
  { name: 'Bathroom Vanity (Comfort Height)', category: 'Architecture - Counters', width: '24" - 72"', depth: '18" - 21"', height: '34" - 36"', notes: 'Contemporary standard' },
  { name: 'Desk Height', category: 'Architecture - Counters', width: 'Varies', depth: '24" - 30"', height: '28" - 30"', notes: 'Standard work surface' },
  { name: 'Reception Desk', category: 'Architecture - Counters', width: '60" - 96"', depth: '24" - 36"', height: '42" - 44"', notes: 'Standing height, front-facing' },
];

const CATEGORIES = [
  'All Categories',
  'Furniture - Seating',
  'Furniture - Tables',
  'Furniture - Storage',
  'Furniture - Beds',
  'Theatre - Flats',
  'Theatre - Platforms',
  'Theatre - Doors',
  'Theatre - Stairs',
  'Event - Tables',
  'Event - Staging',
  'Event - Seating',
  'Event - Linens',
  'Architecture - Circulation',
  'Architecture - Heights',
  'Architecture - Counters',
];

const toMetric = (val: string | undefined) => {
  if (!val) return '';
  // Handle 6'-8" format
  let res = val.replace(/(\d+)'(?:\s*-\s*(\d+(?:\.\d+)?)(?:"|'')?)/g, (_, f, i) => {
    const cm = (parseInt(f) * 30.48) + (parseFloat(i) * 2.54);
    return `${Math.round(cm)} cm`;
  });

  // Handle 6' format (no inches)
  res = res.replace(/(\d+)'(?!-)/g, (_, f) => {
    return `${Math.round(parseInt(f) * 30.48)} cm`;
  });

  // Handle 30" format
  res = res.replace(/(\d+(?:\.\d+)?)"/g, (_, i) => {
    return `${Math.round(parseFloat(i) * 2.54)} cm`;
  });
  return res;
}

export function DimensionReference() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>('imperial');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredDimensions = DIMENSIONS.filter(item => {
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.jargon && item.jargon.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredDimensions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredDimensions.slice(startIndex, endIndex);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 pt-32 pb-24">
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full mb-8">
            <Database className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />
            <span className="font-pixel text-[10px] tracking-[0.2em] text-black/60 dark:text-white/60">REFERENCE DATABASE</span>
          </div>

          <h1 className="font-display text-black dark:text-white text-5xl md:text-6xl lg:text-7xl mb-6 leading-[0.95] italic">
            Dimension Reference
          </h1>
          <p className="text-xl md:text-2xl text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
            Comprehensive database of standard dimensions for furniture, scenic flats, platforms, and architectural elements.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          {/* Category Filter */}
          <div className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl p-6">
            <label className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-3 block">
              CATEGORY
            </label>
            <select
              aria-label="Category Select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 text-black dark:text-white px-4 py-3 rounded-2xl focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl p-6">
            <label className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-3 block">
              SEARCH
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dimensions..."
                className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 text-black dark:text-white pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-black/30 dark:placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Unit Toggle */}
          <div className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl p-6 flex flex-col">
            <label className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-3 block">
              UNITS
            </label>
            <div className="flex-1 flex items-center bg-white dark:bg-black rounded-2xl p-1 border border-black/10 dark:border-white/10">
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${unitSystem === 'imperial'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                  : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
                  }`}
              >
                IMPERIAL
              </button>
              <button
                onClick={() => setUnitSystem('metric')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${unitSystem === 'metric'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                  : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
                  }`}
              >
                METRIC
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span className="font-pixel text-[10px] tracking-[0.2em] text-black/40 dark:text-white/40">
            {filteredDimensions.length} RECORDS FOUND
          </span>
        </motion.div>

        {/* Data Grid */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {currentItems.map((item, index) => (
              <motion.div
                key={`${item.name}-${item.category}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.02 }}
                className="bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 hover:border-black/30 dark:hover:border-white/30 transition-all"
              >
                {/* Item Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl mb-2">{item.name}</h3>
                    <div className="font-pixel text-[10px] tracking-[0.2em] text-black/40 dark:text-white/40">{item.category}</div>
                  </div>
                  <button
                    onClick={() => handleCopy(
                      `${item.name}: W:${item.width || 'N/A'} D:${item.depth || 'N/A'} H:${item.height || 'N/A'}${item.diameter ? ` DIA:${item.diameter}` : ''}`,
                      item.name
                    )}
                    className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
                    title="Copy dimensions"
                    aria-label="Copy dimensions"
                  >
                    {copiedId === item.name ? (
                      <Check className="w-5 h-5 text-black dark:text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-black/40 dark:text-white/40" />
                    )}
                  </button>
                </div>

                {/* Dimensions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-black/10 dark:border-white/10">
                  {item.width && (
                    <div>
                      <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">WIDTH</div>
                      <div className="text-lg">{unitSystem === 'metric' ? toMetric(item.width) : item.width}</div>
                    </div>
                  )}
                  {item.depth && (
                    <div>
                      <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">DEPTH</div>
                      <div className="text-lg">{unitSystem === 'metric' ? toMetric(item.depth) : item.depth}</div>
                    </div>
                  )}
                  {item.height && (
                    <div>
                      <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">HEIGHT</div>
                      <div className="text-lg">{unitSystem === 'metric' ? toMetric(item.height) : item.height}</div>
                    </div>
                  )}
                  {item.diameter && (
                    <div>
                      <div className="font-pixel text-[10px] tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">DIAMETER</div>
                      <div className="text-lg">{unitSystem === 'metric' ? toMetric(item.diameter) : item.diameter}</div>
                    </div>
                  )}
                </div>

                {/* Notes & Jargon */}
                {(item.notes || item.jargon) && (
                  <div className="space-y-2 text-sm">
                    {item.notes && (
                      <div className="flex gap-2">
                        <span className="font-pixel text-[10px] tracking-[0.2em] text-black/40 dark:text-white/40 flex-shrink-0">NOTE:</span>
                        <span className="text-black/60 dark:text-white/60">{item.notes}</span>
                      </div>
                    )}
                    {item.jargon && (
                      <div className="flex gap-2">
                        <span className="font-pixel text-[10px] tracking-[0.2em] text-black/40 dark:text-white/40 flex-shrink-0">JARGON:</span>
                        <span className="text-black/60 dark:text-white/60">{item.jargon}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-4 mt-12 mb-16"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
              className="px-6 py-3 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full disabled:opacity-40 hover:border-black/30 dark:hover:border-white/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-pixel text-[10px] tracking-[0.2em] text-black/60 dark:text-white/60">
              PAGE {currentPage} OF {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
              className="px-6 py-3 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full disabled:opacity-40 hover:border-black/30 dark:hover:border-white/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </motion.div>
        )}

        {/* More Apps Section */}
        {/* More Apps Section */}
        <RelatedTools currentToolId="dimension-reference" />

        {/* Empty State */}
        {filteredDimensions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Database className="w-16 h-16 text-black/20 dark:text-white/20 mx-auto mb-4" />
            <p className="text-xl text-black/60 dark:text-white/60">No dimensions found matching your criteria</p>
            <p className="text-sm text-black/40 dark:text-white/40 mt-2">Try adjusting your filters or search query</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}