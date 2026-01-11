# D:\FYP Mid\AI-Exam-Evaluation-System\exam-evaluation-system\services\bubblesheet-ocr\bubble_sheet_detector.py
"""
Bubble Sheet Answer Detection Pipeline
Complete working pipeline with system integration
"""

import cv2
import numpy as np
import pytesseract
from collections import defaultdict
import sys

def load_and_preprocess_image(image_path):
    """Load and preprocess the bubble sheet image"""
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not load image at {image_path}")
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply bilateral filter to preserve edges while smoothing
    filtered = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Use multiple thresholding methods
    # Method 1: Adaptive threshold
    thresh1 = cv2.adaptiveThreshold(
        filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV, 11, 2
    )
    
    # Method 2: Otsu's threshold (good for scanned documents)
    _, thresh2 = cv2.threshold(filtered, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Combine both methods (take union)
    thresh = cv2.bitwise_or(thresh1, thresh2)
    
    # Clean up noise with morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    
    return image, gray, thresh

def detect_all_bubbles(gray, thresh, min_area=200, max_area=3000):
    """Detect all circular bubbles using multiple methods"""
    bubbles = []
    
    # Method 1: Hough Circle Transform
    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=1,
        minDist=30,
        param1=50,
        param2=30,
        minRadius=12,
        maxRadius=40
    )
    
    if circles is not None:
        circles = np.round(circles[0, :]).astype("int")
        for (x, y, r) in circles:
            bubbles.append({
                'center': (x, y),
                'bbox': (x - r, y - r, 2*r, 2*r),
                'area': np.pi * r * r,
                'contour': None
            })
    
    # Method 2: Contour detection (backup/supplement)
    contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        aspect_ratio = w / float(h)
        area = cv2.contourArea(c)
        
        # More lenient filters
        if min_area < area < max_area and 0.6 <= aspect_ratio <= 1.4:
            perimeter = cv2.arcLength(c, True)
            if perimeter > 0:
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                if circularity > 0.5:
                    center_x = x + w // 2
                    center_y = y + h // 2
                    
                    # Check if not duplicate (from Hough)
                    is_duplicate = False
                    for b in bubbles:
                        dist = np.sqrt((b['center'][0] - center_x)**2 + (b['center'][1] - center_y)**2)
                        if dist < 20:
                            is_duplicate = True
                            break
                    
                    if not is_duplicate:
                        bubbles.append({
                            'center': (center_x, center_y),
                            'bbox': (x, y, w, h),
                            'area': area,
                            'contour': c
                        })
    
    print(f"✓ Detected {len(bubbles)} total bubbles", file=sys.stderr)
    return bubbles

def separate_answer_columns(bubbles, min_gap=200):
    """
    Separate bubbles into distinct answer column groups
    (e.g., questions 1-20 on left, 21-40 on right)
    """
    if not bubbles:
        return []
    
    # Get x-coordinates and sort
    x_coords = sorted([b['center'][0] for b in bubbles])
    
    # Find large gaps that indicate separate answer sections
    column_groups = []
    current_group = [x_coords[0]]
    
    for x in x_coords[1:]:
        if x - current_group[-1] > min_gap:
            # Large gap found - new answer section
            column_groups.append((min(current_group), max(current_group)))
            current_group = [x]
        else:
            current_group.append(x)
    
    if current_group:
        column_groups.append((min(current_group), max(current_group)))
    
    print(f"✓ Found {len(column_groups)} answer sections: {column_groups}", file=sys.stderr)
    return column_groups

def group_bubbles_by_section(bubbles, column_groups):
    """Group bubbles into their respective answer sections"""
    sections = [[] for _ in column_groups]
    
    for bubble in bubbles:
        x = bubble['center'][0]
        for i, (x_min, x_max) in enumerate(column_groups):
            if x_min <= x <= x_max:
                sections[i].append(bubble)
                break
    
    return sections

def identify_option_columns(bubbles, expected_options=4, tolerance=40):
    """
    Within one answer section, identify the 4 option columns (A, B, C, D)
    by finding the 4 rightmost column clusters
    """
    if not bubbles:
        return []
    
    # Get x-coordinates
    x_coords = [b['center'][0] for b in bubbles]
    x_coords_unique = sorted(set(x_coords))
    
    # Cluster x-coordinates into columns with tighter tolerance
    columns = []
    current_col = [x_coords_unique[0]]
    
    for x in x_coords_unique[1:]:
        if x - current_col[-1] <= tolerance:
            current_col.append(x)
        else:
            columns.append(int(np.mean(current_col)))
            current_col = [x]
    
    if current_col:
        columns.append(int(np.mean(current_col)))
    
    # Take the rightmost N columns (these are the option bubbles A,B,C,D)
    # Question number circles are typically on the left
    if len(columns) > expected_options:
        option_columns = sorted(columns)[-expected_options:]
        print(f"  ✓ Selected {expected_options} rightmost columns as options: {option_columns}", file=sys.stderr)
    else:
        option_columns = sorted(columns)
        print(f"  ✓ Using all {len(columns)} columns as options: {option_columns}", file=sys.stderr)
    
    return option_columns

def filter_bubbles_by_columns(bubbles, option_columns, tolerance=40):
    """Filter to keep only bubbles in the specified option columns"""
    filtered = []
    for bubble in bubbles:
        x = bubble['center'][0]
        for col_x in option_columns:
            if abs(x - col_x) <= tolerance:
                filtered.append(bubble)
                break
    return filtered

def group_into_rows(bubbles, row_tolerance=35):
    """Group bubbles into horizontal rows"""
    if not bubbles:
        return []
    
    y_coords = [b['center'][1] for b in bubbles]
    y_coords_sorted = sorted(set(y_coords))
    
    rows = []
    current_row = [y_coords_sorted[0]]
    
    for y in y_coords_sorted[1:]:
        if y - current_row[-1] <= row_tolerance:
            current_row.append(y)
        else:
            rows.append(int(np.mean(current_row)))
            current_row = [y]
    
    if current_row:
        rows.append(int(np.mean(current_row)))
    
    return sorted(rows)

def assign_to_grid(bubbles, columns, rows, tolerance=50):
    """Assign each bubble to grid position (row, col)"""
    grid = defaultdict(dict)
    
    for bubble in bubbles:
        x, y = bubble['center']
        
        # Find closest column
        col_idx = min(range(len(columns)), key=lambda i: abs(columns[i] - x))
        if abs(columns[col_idx] - x) > tolerance:
            continue
        
        # Find closest row
        row_idx = min(range(len(rows)), key=lambda i: abs(rows[i] - y))
        if abs(rows[row_idx] - y) > tolerance:
            continue
        
        grid[row_idx][col_idx] = bubble
    
    return grid

def calculate_fill_ratio(bubble, thresh):
    """Calculate fill ratio of a bubble"""
    x, y, w, h = bubble['bbox']
    roi = thresh[y:y+h, x:x+w]
    
    if roi.size == 0:
        return 0.0
    
    # Create circular mask
    mask = np.zeros((h, w), dtype=np.uint8)
    center = (w // 2, h // 2)
    radius = min(w, h) // 2
    cv2.circle(mask, center, radius, 255, -1)
    
    # Count filled pixels
    filled = cv2.countNonZero(cv2.bitwise_and(roi, roi, mask=mask))
    total = cv2.countNonZero(mask)
    
    return filled / total if total > 0 else 0.0

def read_question_number(gray, first_bubble, section_x_min):
    """Read question number from left of the row"""
    x, y, w, h = first_bubble['bbox']
    
    # ROI between section start and first bubble - make it wider
    roi_x1 = max(0, section_x_min - 50)  # Start even before section boundary
    roi_x2 = x - 5
    roi_y1 = max(0, y - 10)
    roi_y2 = y + h + 10
    
    if roi_x2 <= roi_x1 or roi_y2 <= roi_y1:
        return None
    
    roi = gray[roi_y1:roi_y2, roi_x1:roi_x2]
    
    if roi.size == 0:
        return None
    
    # Enhance for OCR - more aggressive preprocessing
    roi = cv2.resize(roi, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
    
    # Try multiple thresholding methods
    _, roi1 = cv2.threshold(roi, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    roi2 = cv2.adaptiveThreshold(roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                  cv2.THRESH_BINARY, 11, 2)
    
    # Try OCR on both
    config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789'
    
    for roi_processed in [roi1, roi2]:
        text = pytesseract.image_to_string(roi_processed, config=config).strip()
        numbers = ''.join(filter(str.isdigit, text))
        
        if numbers and len(numbers) <= 3:  # Valid question numbers are 1-3 digits
            try:
                return int(numbers)
            except (ValueError, TypeError):
                pass
    
    return None

def process_answer_section(section_bubbles, section_idx, section_bounds, gray, thresh, 
                           fill_threshold=0.35, expected_options=4):
    """Process one answer section (e.g., questions 1-20)"""
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"Processing Answer Section {section_idx + 1}", file=sys.stderr)
    print('='*60, file=sys.stderr)
    
    if not section_bubbles:
        return []
    
    # Identify option columns (A, B, C, D)
    option_columns = identify_option_columns(section_bubbles, expected_options)
    
    # Filter to only option bubbles
    option_bubbles = filter_bubbles_by_columns(section_bubbles, option_columns)
    print(f"  ✓ Filtered to {len(option_bubbles)} option bubbles", file=sys.stderr)
    
    # Group into rows
    rows = group_into_rows(option_bubbles)
    print(f"  ✓ Found {len(rows)} question rows", file=sys.stderr)
    
    # Create grid
    grid = assign_to_grid(option_bubbles, option_columns, rows)
    
    # Extract answers
    answers = []
    filled_bubbles = []
    
    # Calculate base question number for this section
    sequential_num = (section_idx * 20) + 1  # Section 0: Q1, Section 1: Q21
    ocr_failures = 0  # Track OCR failures
    
    for row_idx in sorted(grid.keys()):
        row_bubbles = grid[row_idx]
        
        # Must have exactly 4 option bubbles
        if len(row_bubbles) != expected_options:
            print(f"  ⚠️  Row {row_idx}: Has {len(row_bubbles)} bubbles, expected {expected_options} - SKIPPING", file=sys.stderr)
            continue
        
        # Try OCR for question number
        first_bubble = row_bubbles[min(row_bubbles.keys())]
        ocr_question_num = read_question_number(gray, first_bubble, section_bounds[0])
        
        # Validate OCR result
        expected_min = section_idx * 20 + 1
        expected_max = (section_idx + 1) * 20
        ocr_valid = False
        
        if ocr_question_num is not None and expected_min <= ocr_question_num <= expected_max:
            ocr_valid = True
            question_num = ocr_question_num
        else:
            ocr_failures += 1
            
        # If OCR is consistently failing (>3 failures), switch to pure sequential mode
        if ocr_failures > 3:
            question_num = sequential_num
            if ocr_question_num is not None:
                print(f"  ⚠️  OCR unreliable, using sequential Q{sequential_num} (OCR said Q{ocr_question_num})", file=sys.stderr)
        elif not ocr_valid:
            question_num = sequential_num
            if ocr_question_num is not None:
                print(f"  ⚠️  OCR gave Q{ocr_question_num} (expected Q{expected_min}-Q{expected_max}), using Q{sequential_num}", file=sys.stderr)
        
        sequential_num += 1  # Always increment for next valid row
        
        # Calculate fill ratios
        fill_ratios = {}
        for col_idx in sorted(row_bubbles.keys()):
            bubble = row_bubbles[col_idx]
            ratio = calculate_fill_ratio(bubble, thresh)
            option = chr(65 + col_idx)  # A, B, C, D
            fill_ratios[option] = ratio
        
        # Find most filled
        max_option = max(fill_ratios, key=fill_ratios.get)
        max_ratio = fill_ratios[max_option]
        
        # Check if clearly marked
        if max_ratio >= fill_threshold:
            other_ratios = [r for opt, r in fill_ratios.items() if opt != max_option]
            if other_ratios:
                gap = max_ratio - max(other_ratios)
                if gap >= 0.10:  # 10% minimum gap
                    answers.append({
                        "question_number": question_num,
                        "selected_option": max_option
                    })
                    filled_bubbles.append(bubble)
                    print(f"  Q{question_num}: {max_option} (fill={max_ratio:.2f})", file=sys.stderr)
                else:
                    print(f"  Q{question_num}: Ambiguous (fill={max_ratio:.2f}, gap={gap:.2f})", file=sys.stderr)
            else:
                answers.append({
                    "question_number": question_num,
                    "selected_option": max_option
                })
                filled_bubbles.append(bubble)
                print(f"  Q{question_num}: {max_option} (fill={max_ratio:.2f})", file=sys.stderr)
        else:
            print(f"  Q{question_num}: No mark (max fill={max_ratio:.2f})", file=sys.stderr)
    
    return answers, filled_bubbles

def extract_student_answers(image_path, fill_threshold=0.35, expected_options=4, debug=False):
    """
    Extract answers from bubble sheet with multiple answer sections
    """
    try:
        print(f"\n{'='*70}", file=sys.stderr)
        print(f"PROCESSING: {image_path}", file=sys.stderr)
        print('='*70, file=sys.stderr)
        
        original, gray, thresh = load_and_preprocess_image(image_path)
        
        # Detect all bubbles
        all_bubbles = detect_all_bubbles(gray, thresh)
        
        if not all_bubbles:
            print("❌ No bubbles detected", file=sys.stderr)
            return []
        
        # Separate into answer sections (left/right columns)
        column_groups = separate_answer_columns(all_bubbles)
        sections = group_bubbles_by_section(all_bubbles, column_groups)
        
        # Process each section
        all_answers = []
        all_filled_bubbles = []
        
        for i, section_bubbles in enumerate(sections):
            answers, filled = process_answer_section(
                section_bubbles, i, column_groups[i], 
                gray, thresh, fill_threshold, expected_options
            )
            all_answers.extend(answers)
            all_filled_bubbles.extend(filled)
        
        # Visualize (only if debug is True)
        if debug:
            visualize_results(original, thresh, all_bubbles, all_filled_bubbles)
        
        print(f"\n{'='*70}", file=sys.stderr)
        print(f"✅ TOTAL EXTRACTED: {len(all_answers)} answers", file=sys.stderr)
        print('='*70, file=sys.stderr)
        
        return all_answers
    
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return []

def visualize_results(original, thresh, all_bubbles, filled_bubbles):
    """Visualize detection results"""
    vis = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)
    
    for bubble in all_bubbles:
        x, y, w, h = bubble['bbox']
        cv2.rectangle(vis, (x, y), (x+w, y+h), (0, 255, 0), 2)
    
    for bubble in filled_bubbles:
        x, y, w, h = bubble['bbox']
        cv2.rectangle(vis, (x, y), (x+w, y+h), (0, 0, 255), 3)
    
    cv2.namedWindow("Results", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Results", 1000, 1400)
    cv2.imshow("Results", vis)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# ============================================================================
# SYSTEM INTEGRATION - Command Line Interface
# ============================================================================
if __name__ == "__main__":
    # Get image path from command line argument
    if len(sys.argv) < 2:
        print("Usage: python3 bubble_sheet_detector.py <image_path>", file=sys.stderr)
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    try:
        # Process the bubble sheet
        answers = extract_student_answers(
            image_path, 
            fill_threshold=0.35,
            expected_options=4,
            debug=False  # Set to False for production
        )
        
        # Output results in simple format for the Node.js system to parse
        print("\nFINAL ANSWERS:")
        for ans in sorted(answers, key=lambda x: x['question_number']):
            print(f"Q{ans['question_number']}: {ans['selected_option']}")
            
    except Exception as e:
        print(f"Error processing bubble sheet: {e}", file=sys.stderr)
        sys.exit(1)